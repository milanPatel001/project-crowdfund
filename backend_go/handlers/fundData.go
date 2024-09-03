package handlers

import (
	"backend/utils"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type CrowdFund struct {
	Img         []byte
	Name        string
	Story       string
	Beneficiary string
	Title       string
	Place       string
	Goal        int
}

type AWSRouter struct {
	DB     *Database
	Client *s3.Client
}

func (router *AWSRouter) FundCreationHandler(ctx context.Context) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		mr, err := r.MultipartReader()

		if err != nil {
			http.Error(w, "Unable to create multipart reader", http.StatusBadRequest)
			return
		}

		crowdFund := CrowdFund{}
		var imageType string

		// reading the multipart form data
		for {
			part, err := mr.NextPart()

			if err == io.EOF {
				break
			}

			if err != nil {
				http.Error(w, "Unable to read part", http.StatusInternalServerError)
				return
			}

			var imageSaved bool

			formName := part.FormName()
			switch formName {
			case "name", "story", "beneficiary", "title", "goal", "place":
				buf := new(bytes.Buffer)

				_, err := io.Copy(buf, part)
				if err != nil {
					http.Error(w, "Unable to read text field", http.StatusInternalServerError)
					return
				}

				data := buf.String()
				fmt.Println(data)

				if formName == "goal" {
					crowdFund.Goal, err = strconv.Atoi(data)
					if err != nil {
						http.Error(w, "Problem converting goal field", http.StatusInternalServerError)
						return
					}
				} else if formName == "beneficiary" {
					crowdFund.Beneficiary = data
				} else if formName == "title" {
					crowdFund.Title = data
				} else if formName == "story" {
					crowdFund.Story = data
				} else if formName == "place" {
					crowdFund.Place = data
				} else {
					crowdFund.Name = data
				}

			case "img":
				if imageSaved {
					break
				}

				var fileSize int64
				var buffer bytes.Buffer

				contentBuf := make([]byte, 512)
				n, err := part.Read(contentBuf)
				if err != nil && err != io.EOF {
					http.Error(w, "Error reading file", http.StatusInternalServerError)
					return
				}

				// Detect the content type
				contentType := http.DetectContentType(contentBuf[:n])
				if contentType != "image/jpeg" && contentType != "image/png" && contentType != "image/gif" {
					http.Error(w, "File is not a valid image", http.StatusBadRequest)
					return
				}

				imageType = strings.Split(contentType, "/")[1]

				buffer.Write(contentBuf[:n])

				// Check the rest of the file size while reading
				fileSize += int64(n)

				buf := make([]byte, 32*1024)

				// check remaining image bytes
				for {
					n, err := part.Read(buf)
					if n > 0 {
						fileSize += int64(n)
						if fileSize > (32 << 20) {
							http.Error(w, "File size exceeds 32 MB limit", http.StatusBadRequest)
							return
						}
						buffer.Write(buf[:n])
					}
					if err == io.EOF {
						break
					}
					if err != nil {
						http.Error(w, "Error reading file", http.StatusInternalServerError)
						return
					}
				}

				crowdFund.Img = buffer.Bytes()
				imageSaved = true
			}

		}

		imgName := utils.GenerateCustomID()
		key := "images/" + imgName + "." + imageType

		err = utils.UploadImageToS3(ctx, router.Client, crowdFund.Img, utils.AWS_BUCKET, key)
		if err != nil {
			fmt.Println("Couldn't upload img to S3")
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		url := utils.GetPermanentURL(utils.AWS_BUCKET, utils.AWS_REGION, key)

		_, err = router.DB.CreateCrowdFund(ctx, crowdFund.Name, crowdFund.Place, crowdFund.Beneficiary, crowdFund.Title, crowdFund.Story, url, crowdFund.Goal)
		if err != nil {
			fmt.Println("Couldn't upload crowdfund data to db!!")
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Write([]byte(url))
	}
}

func (router *Router) FundsDataHandler(ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fundsData, err := router.DB.GetFundsData(ctx)

		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(fundsData)

	}
}

func (router *Router) HistoryHandler(ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		id, _ := strconv.Atoi(q.Get("id"))
		data, err := router.DB.GetUserHistory(ctx, id)

		if err != nil {
			fmt.Println("Can't fetch history")
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}
