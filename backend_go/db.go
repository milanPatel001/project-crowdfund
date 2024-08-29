package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Comment struct {
	Id      int64  `json:"id"`
	FundId  int64  `json:"fund_id"`
	Donator string `json:"donator"`
	Comment string `json:"comment"`
	Amount  int    `json:"amount"`
}

type RecentDonator struct {
	Id      int64  `json:"id"`
	FundId  int64  `json:"fund_id"`
	Donator string `json:"donator"`
	Amount  int    `json:"amount"`
}

type FundData struct {
	Id              int64           `json:"id"`
	Name            string          `json:"name"`
	Story           string          `json:"story"`
	BeneficiaryName string          `json:"beneficiary_name"`
	Place           string          `json:"place"`
	Title           string          `json:"title"`
	Img             string          `json:"img"`
	CreatedAt       time.Time       `json:"created_at"`
	Goal            int             `json:"goal"`
	DonationNum     int             `json:"donation_num"`
	TotalDonation   int             `json:"total_donation"`
	Comments        []Comment       `json:"comments"`
	RecentDonators  []RecentDonator `json:"recentdonators"`
}

func HandleDbConnection() (*pgxpool.Pool, error) {
	connectionStr := os.Getenv("PG_URL")

	config, err := pgxpool.ParseConfig(connectionStr)
	if err != nil {
		return nil, fmt.Errorf("unable to parse config: %w", err)
	}

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return nil, fmt.Errorf("unable to create connection pool: %w", err)
	}

	return pool, nil
}

func (db *Database) EmailExistsQuery(email string) (bool, error) {

	var id string
	err := db.pool.QueryRow(context.Background(), "SELECT id FROM users WHERE email = $1", email).Scan(&id)

	if err == pgx.ErrNoRows {
		return false, nil
	}

	return true, err
}

func (db *Database) SaveUserInfo(lname string, fname string, email string, password string) error {

	hashedPassword, err := HashPassword(password)

	if err != nil {
		return err
	}

	commandTag, err := db.pool.Exec(context.Background(),
		"INSERT INTO users (fname, lname, email, hashed_password) VALUES ($1, $2, $3, $4)",
		fname, lname, email, hashedPassword)

	if err != nil {
		return fmt.Errorf("Insert failed: %s", err)
	}

	fmt.Printf("Insert successful: %d rows affected\n", commandTag.RowsAffected())

	return nil
}

func (db *Database) DoesUserExists(email string, password string) (int64, error) {
	var id int64
	var hashed_password string

	err := db.pool.QueryRow(context.Background(), "SELECT id, hashed_password FROM users WHERE email = $1", email).Scan(&id, &hashed_password)

	if err == pgx.ErrNoRows {
		return -1, fmt.Errorf("Email is wrong!!")
	}

	isPasswordNotValid := CheckPassword(hashed_password, password)

	if isPasswordNotValid != nil {
		return -1, fmt.Errorf("Password not valid..")
	}

	return id, nil
}

func (db *Database) GetFundsData() ([]FundData, error) {

	query := "SELECT fd.*, coalesce(c_agg.comments_agg, '[]'::json) AS comments, coalesce(rd_agg.recent_donators_agg, '[]'::json) AS recentDonators FROM fundsData AS fd LEFT JOIN (SELECT fund_id, json_agg(json_build_object('id', id, 'donator', donator, 'amount', amount, 'comment', comment)) AS comments_agg FROM comments GROUP BY fund_id) AS c_agg ON fd.id = c_agg.fund_id LEFT JOIN (SELECT fund_id, json_agg(json_build_object('donator', donator, 'amount', amount)) AS recent_donators_agg FROM recentDonators GROUP BY fund_id) AS rd_agg ON fd.id = rd_agg.fund_id"

	rows, err := db.pool.Query(context.Background(), query)

	if err != nil {
		fmt.Println("Query failed:", err)
		return nil, err
	}
	defer rows.Close()

	data := []FundData{}

	for rows.Next() {

		fd := FundData{}

		var comments, recentdonators []byte

		if err := rows.Scan(&fd.Id, &fd.Name, &fd.Story, &fd.BeneficiaryName, &fd.Place, &fd.Title, &fd.Img, &fd.CreatedAt, &fd.Goal, &fd.DonationNum, &fd.TotalDonation, &comments, &recentdonators); err != nil {
			fmt.Println("Failed to scan row:", err)
			return nil, err
		}

		json.Unmarshal(comments, &fd.Comments)
		json.Unmarshal(recentdonators, &fd.RecentDonators)

		data = append(data, fd)
	}

	//fmt.Println(data)

	return data, nil
}

func (db *Database) SaveComment(fundId int, donator string, amount int, comment string) error {
	commandTag, err := db.pool.Exec(context.Background(), "INSERT INTO comments (fund_id, donator, comment, amount) VALUES($1, $2, $3, $4) ", fundId, donator, comment, amount)

	if err != nil {
		return fmt.Errorf("Insert failed: %s", err)
	}

	fmt.Printf("Comment Insert successful:\n", commandTag.RowsAffected())

	return nil

}

func (db *Database) SaveRecentDonator(fundId int, donator string, amount int) error {
	commandTag, err := db.pool.Exec(context.Background(), "INSERT INTO recentdonators (fund_id, donator, amount) VALUES($1, $2, $3)", fundId, donator, amount)

	if err != nil {
		return fmt.Errorf("Insert failed: %s", err)
	}

	fmt.Printf("Recent Donator Insert successful:\n", commandTag.RowsAffected())

	return nil
}

func (db *Database) SaveInHistory(donator Donator, userId int, organizer string) error {
	commandTag, err := db.pool.Exec(context.Background(), "INSERT INTO history (user_id, amount, organizer, beneficiary, donated_at) VALUES($1, $2, $3, $4, $5)", userId, donator.Amount, organizer, donator.Beneficiary, "today")

	if err != nil {
		return fmt.Errorf("Insert failed: %s", err)
	}

	fmt.Printf("History Insert successful:\n", commandTag.RowsAffected())

	return nil
}

func (db *Database) IncreaseDonationInFundsData(amount int, fundId int) error {
	commandTag, err := db.pool.Exec(context.Background(), "UPDATE fundsdata SET donation_num = donation_num + 1, total_donation = total_donation + $1 WHERE id = $2", amount, fundId)

	if err != nil {
		return fmt.Errorf("Insert failed: %s", err)
	}

	fmt.Printf("Fundata Update successful:\n", commandTag.RowsAffected())

	return nil
}

func (db *Database) SaveDonation(metaData map[string]string) error {

	tx, err := db.pool.Begin(context.Background())

	if err != nil {
		return fmt.Errorf("could not begin transaction: %v", err)
	}

	defer func() {
		if err != nil {
			tx.Rollback(context.Background())
			fmt.Println("Transaction rolled back due to an error:", err)
		}
	}()

	amount, _ := strconv.Atoi(metaData["amount"])
	fundId, _ := strconv.Atoi(metaData["fundId"])
	userId, _ := strconv.Atoi(metaData["userId"])

	d := Donator{
		metaData["fundId"],
		amount,
		metaData["beneficiary"],
		metaData["donator"],
		metaData["comment"],
	}

	err = db.SaveRecentDonator(fundId, d.Name, amount)
	if err != nil {
		return fmt.Errorf("Could not execute query: %v", err)
	}

	if d.Comment != "" {
		err = db.SaveComment(fundId, d.Name, amount, d.Comment)
		if err != nil {
			return fmt.Errorf("Could not execute query: %v", err)
		}
	}

	err = db.SaveInHistory(d, userId, metaData["organizer"])
	if err != nil {
		return fmt.Errorf("Could not execute query: %v", err)
	}

	err = db.IncreaseDonationInFundsData(amount, fundId)
	if err != nil {
		return fmt.Errorf("Could not execute query: %v", err)
	}

	if err = tx.Commit(context.Background()); err != nil {
		return fmt.Errorf("could not commit transaction: %v", err)
	}

	return nil
}
