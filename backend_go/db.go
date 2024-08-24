package main

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

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

func (db *Database) ExecuteQuery() {
	// Example query
	rows, err := db.pool.Query(context.Background(), "SELECT id, fname FROM users")
	if err != nil {
		fmt.Println("Query failed:", err)
		return
	}
	defer rows.Close()

	// Process query results
	for rows.Next() {
		var id int
		var fname string
		if err := rows.Scan(&id, &fname); err != nil {
			fmt.Println("Failed to scan row:", err)
			return
		}
		fmt.Printf("ID: %d, Name: %s\n", id, fname)

	}
}

func (db *Database) EmailExistsQuery(email string) (bool, error) {

	var id string
	err := db.pool.QueryRow(context.Background(), "SELECT id FROM users WHERE email = $1", email).Scan(&id)

	if err == pgx.ErrNoRows {
		return false, nil
	}

	return true, err
}

func (db *Database) SaveUserInfoQuery(lname string, fname string, email string, password string) error {

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
