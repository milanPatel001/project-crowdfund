package handlers

import (
	"backend/utils"
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

type History struct {
	Id          int    `json:"id"`
	Beneficiary string `json:"beneficiary"`
	Organizer   string `json:"organizer"`
	Amount      int    `json:"amount"`
	DonatedAt   string `json:"donated_at"`
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

func (db *Database) CreateCrowdFund(ctx context.Context, name, place, beneficiary, title, story, imgUrl string, goal int) (int64, error) {

	var id int64

	err := db.Pool.QueryRow(ctx,
		"INSERT INTO fundsdata (name, story, beneficiary_name, place, title, img, created_at, goal, donation_num, total_donation) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id",
		name, story, beneficiary, place, title, imgUrl, time.Now(), goal, 0, 0).Scan(&id)

	if err != nil {
		return -1, fmt.Errorf("Insert failed: %s", err)
	}

	fmt.Printf("\nFundData Insert successful\n")

	return id, nil
}

func HandleDbConnection(ctx context.Context) (*pgxpool.Pool, error) {
	connectionStr := os.Getenv("PG_URL")

	config, err := pgxpool.ParseConfig(connectionStr)
	if err != nil {
		return nil, fmt.Errorf("unable to parse config: %w", err)
	}

	Pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("unable to create connection Pool: %w", err)
	}

	return Pool, nil
}

func (db *Database) EmailExistsQuery(ctx context.Context, email string) (int64, error) {

	var id int64
	err := db.Pool.QueryRow(ctx, "SELECT id FROM users WHERE email = $1", email).Scan(&id)

	if err == pgx.ErrNoRows {
		return -1, nil
	}

	return id, err
}

func (db *Database) SaveUserInfo(ctx context.Context, lname string, fname string, email string, password string, googleLogin bool, isVerified bool) (int64, error) {

	hashedPassword, err := utils.HashPassword(password)

	if err != nil {
		return -1, err
	}

	var id int64

	err = db.Pool.QueryRow(ctx,
		"INSERT INTO users (fname, lname, email, hashed_password, google_login, is_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
		fname, lname, email, hashedPassword, googleLogin, isVerified).Scan(&id)

	if err != nil {
		return -1, fmt.Errorf("Insert failed: %s", err)
	}

	fmt.Printf("\nUser Insert successful\n")

	return id, nil
}

func (db *Database) DoesUserExists(ctx context.Context, email string, password string) (int64, error) {
	var id int64
	var hashed_password string

	err := db.Pool.QueryRow(ctx, "SELECT id, hashed_password FROM users WHERE email = $1", email).Scan(&id, &hashed_password)

	if err == pgx.ErrNoRows {
		return -1, fmt.Errorf("Email is wrong!!")
	}

	isPasswordNotValid := utils.CheckPassword(hashed_password, password)

	if isPasswordNotValid != nil {
		return -1, fmt.Errorf("Password not valid..")
	}

	return id, nil
}

func (db *Database) GetFundsData(ctx context.Context) ([]FundData, error) {

	query := "SELECT fd.*, coalesce(c_agg.comments_agg, '[]'::json) AS comments, coalesce(rd_agg.recent_donators_agg, '[]'::json) AS recentDonators FROM fundsData AS fd LEFT JOIN (SELECT fund_id, json_agg(json_build_object('id', id, 'donator', donator, 'amount', amount, 'comment', comment)) AS comments_agg FROM comments GROUP BY fund_id) AS c_agg ON fd.id = c_agg.fund_id LEFT JOIN (SELECT fund_id, json_agg(json_build_object('donator', donator, 'amount', amount) ORDER BY id DESC) AS recent_donators_agg FROM recentDonators GROUP BY fund_id) AS rd_agg ON fd.id = rd_agg.fund_id"

	rows, err := db.Pool.Query(ctx, query)

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

func (db *Database) GetUserHistory(ctx context.Context, userId int) ([]History, error) {
	query := "SELECT id, amount, organizer, beneficiary, donated_at FROM history WHERE user_id = $1"

	rows, err := db.Pool.Query(ctx, query, userId)

	if err != nil {
		fmt.Println("Query failed:", err)
		return nil, err
	}
	defer rows.Close()

	data := []History{}

	for rows.Next() {

		fd := History{}

		if err := rows.Scan(&fd.Id, &fd.Amount, &fd.Organizer, &fd.Beneficiary, &fd.DonatedAt); err != nil {
			fmt.Println("Failed to scan row:", err)
			return nil, err
		}

		data = append(data, fd)
	}

	return data, nil
}

func (db *Database) SaveComment(ctx context.Context, fundId int, donator string, amount int, comment string) error {
	commandTag, err := db.Pool.Exec(ctx, "INSERT INTO comments (fund_id, donator, comment, amount) VALUES($1, $2, $3, $4) ", fundId, donator, comment, amount)

	if err != nil {
		return fmt.Errorf("Insert failed: %s", err)
	}

	fmt.Println("Comment Insert successful:\n", commandTag.RowsAffected())

	return nil

}

func (db *Database) SaveRecentDonator(ctx context.Context, fundId int, donator string, amount int) error {
	commandTag, err := db.Pool.Exec(ctx, "INSERT INTO recentdonators (fund_id, donator, amount) VALUES($1, $2, $3)", fundId, donator, amount)

	if err != nil {
		return fmt.Errorf("Insert failed: %s", err)
	}

	fmt.Println("Recent Donator Insert successful:\n", commandTag.RowsAffected())

	return nil
}

func (db *Database) SaveInHistory(ctx context.Context, donator Donator, userId int, organizer string) error {
	commandTag, err := db.Pool.Exec(ctx, "INSERT INTO history (user_id, amount, organizer, beneficiary, donated_at) VALUES($1, $2, $3, $4, $5)", userId, donator.Amount, organizer, donator.Beneficiary, "today")

	if err != nil {
		return fmt.Errorf("Insert failed: %s", err)
	}

	fmt.Println("History Insert successful:\n", commandTag.RowsAffected())

	return nil
}

func (db *Database) IncreaseDonationInFundsData(ctx context.Context, amount int, fundId int) error {
	commandTag, err := db.Pool.Exec(ctx, "UPDATE fundsdata SET donation_num = donation_num + 1, total_donation = total_donation + $1 WHERE id = $2", amount, fundId)

	if err != nil {
		return fmt.Errorf("Insert failed: %s", err)
	}

	fmt.Println("Fundata Update successful:\n", commandTag.RowsAffected())

	return nil
}

func (db *Database) SaveDonation(ctx context.Context, metaData map[string]string) error {

	tx, err := db.Pool.Begin(ctx)

	if err != nil {
		return fmt.Errorf("could not begin transaction: %v", err)
	}

	defer func() {
		if err != nil {
			tx.Rollback(ctx)
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

	err = db.SaveRecentDonator(ctx, fundId, d.Name, amount)
	if err != nil {
		return fmt.Errorf("Could not execute query: %v", err)
	}

	if d.Comment != "" {
		err = db.SaveComment(ctx, fundId, d.Name, amount, d.Comment)
		if err != nil {
			return fmt.Errorf("Could not execute query: %v", err)
		}
	}

	err = db.SaveInHistory(ctx, d, userId, metaData["organizer"])
	if err != nil {
		return fmt.Errorf("Could not execute query: %v", err)
	}

	err = db.IncreaseDonationInFundsData(ctx, amount, fundId)
	if err != nil {
		return fmt.Errorf("Could not execute query: %v", err)
	}

	if err = tx.Commit(ctx); err != nil {
		return fmt.Errorf("could not commit transaction: %v", err)
	}

	return nil
}
