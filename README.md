# Share-It: A file sharing application

This project is the API backend for a file-sharing application. It has the following features:
1. Login/registration for users (via Hasura Auth APIs)
2. Upload/Download files (via Hasura Filestore APIs)
3. File sharing (modelled as tables in the database, APIs via Hasura Data APIs)


## Quickstart

Here are the 2 steps to deploy this application on your own Hasura free cluster.
Before you begin, ensure you have the latest version of [hasura CLI](https://docs.hasura.io/0.15/manual/install-hasura-cli.html) tool installed.

#### Step 1: Clone this project and create a free hasura cluster

```sh
$ hasura quickstart karthik/file-sharing-app
$ cd file-sharing-app
```

The above command does the following:
1. Creates a new folder in the current working directory called `file-sharing-app`
2. Creates a new trial hasura cluster for you and sets that cluster as the default cluster for this project
3. Initializes `file-sharing-app` as a git repository and adds the necessary git remotes.

### Step 2: Deploy!

```bash
$ git add .
$ git commit -m "Initial Commit"
$ git push hasura master
```

## Project structure

This Hasura project contains the following:

1. `migrations/`: This contains the schema of the data model for file sharing
  - 3 tables: `user`, `user_file` and `file_share`
2. `microservices/file-check`: A nodejs microservice which implements a permissions webhook API
3. `conf/filestore.yaml`: Configure hasura filestore APIs to use a custom permission webhook

## Test the APIs

To test and browse the APIs that are deployed, open up the api-console:
```bash
$ hasura api-console
```

This will open up the API console on `http://localhost:9695` and will allow you to start testing your APIs.

#### Step 1: Create 2 users

On the API console, head to the API explorer. On the sidebar, choose the `Auth > Username/password login > Signup` API and create 2 users using the Hasura Auth APIs.

Let's say the first username is `alice` and the second is `bob`.

_insert image here_


Note that each successful registration request (using the basic username/password provider) will return an `authorization token`, and `user_id` that identifies the particular user in subsequent API requests.

_insert tokens here_

#### Step 2: Upload a file as `alice`


**Use the filestore API to upload**
_insert image here_

**Use the data API to store metadata and filesharing info**
_insert image here_


File APIs on Hasura lets users upload and store files on a Hasura project and also download when required. The API exposes upload, download and delete methods as well as provide permission options based on user’s ID or Role to decide who can create, read or delete files.

It comes with three default hook urls readily available to be used with any project. Checkout [https://docs.hasura.io/0.15/manual/files/permission.html](link) for more info

Since our logic is entirely dependent on our database state(Who owns the file and who it is shared with), we will write our own custom hook.
This quickstart project consists of a nodejs-express application which implements this custom hook. 


## Demo

To test this application, lets create two users as follows

User can be created by using Hasura Auth API's as follows. Checkout [this](https://docs.hasura.io/0.15/manual/users/index.html) link to know more about Hasura Auth API's

### To create user 1

#### Request

```http

curl -X POST -H "Content-Type: application/json" -d '{
    "provider": "username",
    "data": {
        "username": "user1",
        "password": "user@123"
    }
}' "https://auth.h34-ballyhoo30-stg.hasura-app.io/v1/signup"

```

#### Response:

```
{
	"auth_token": "805daf29f8042ed2870b785db2ad69560e397174bb1a12b9",
		"username": "user1",
		"hasura_id": 4,
		"hasura_roles": [
			"user"
		]
}
```

Lets note down the `hasura_id` and `auth_token` for future reference

Lets create an application user using the Hasura Data API's as follows. Checkout [this](https://docs.hasura.io/0.15/manual/data/index.html) link to know more about Hasura Data API's

#### Request

```http

curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer 27f9a9c7522c15ddaddcf1033c00c63c0d7477d101fc8fca" -d '{
    "type": "insert",
    "args": {
        "table": "user",
        "objects": [
            {
                "id": "4",
                "email": "user1@hasura.io"
            }
        ],
        "returning": [
            "id",
            "email"
        ]
    }
}' "https://data.h34-ballyhoo30-stg.hasura-app.io/v1/query"

```

#### Response

```

{
	"affected_rows": 1,
	"returning": [
		{
			"id": 4,
			"email": "user1@hasura.io"
		}
	]
}

```

### Lets create user 2 in the same way as above

#### Request

```http

curl -X POST -H "Content-Type: application/json" -d '{
    "provider": "username",
    "data": {
        "username": "user2",
        "password": "user@123"
    }
}' "https://auth.h34-ballyhoo30-stg.hasura-app.io/v1/signup"

```

#### Response:

```

{
    "auth_token": "43bbd9f5eab9c9b82d17d9836e1d866a52103b0fa2e9c1c1",
    "username": "user2",
    "hasura_id": 5,
    "hasura_roles": [
        "user"
    ]
}

```

Again lets note down the `hasura_id` and `auth_token` for future reference

Create an application user

#### Request

```http

curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer 43bbd9f5eab9c9b82d17d9836e1d866a52103b0fa2e9c1c1" -d '{
    "type": "insert",
    "args": {
        "table": "user",
        "objects": [
            {
                "id": "5",
                "email": "user2@hasura.io"
            }
        ],
        "returning": [
            "id",
            "email"
        ]
    }
}' "https://data.h34-ballyhoo30-stg.hasura-app.io/v1/query"

```

#### Response

```

{
	"affected_rows": 1,
	"returning": [
		{
			"id": 5,
			"email": "user2@hasura.io"
		}
	]
}

```

Lets upload file assuming as user 1. Please note that we are using the auth_token of `user1` in the following request to upload a file
#### Request

```http

curl -X POST -H "Authorization: Bearer 805daf29f8042ed2870b785db2ad69560e397174bb1a12b9"  --data-binary @/home/karthik/Documents/Screenshots/genCode.jpg  "https://filestore.h34-ballyhoo30-stg.hasura-app.io/v1/file"

```

#### Response

```

{
    "file_id": "933470ad-feeb-4dcc-9f40-8ec4bcc7c0c1",
    "user_id": 4,
    "user_role": "user",
    "content_type": "image/jpeg",
    "file_status": "uploaded",
    "created_at": "2017-11-08T18:57:00.451737676Z",
    "file_size": 145089
}

```

Now the file is successfully created by the Hasura file store API. Lets store the file id with us

#### Request

```http

curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer 805daf29f8042ed2870b785db2ad69560e397174bb1a12b9" -d '{
    "type": "insert",
    "args": {
        "table": "user_file",
        "objects": [
            {
                "user_id": "4",
                "file_id": "933470ad-feeb-4dcc-9f40-8ec4bcc7c0c1"
            }
        ],
        "returning": [
            "id"
        ]
    }
}' "https://data.h34-ballyhoo30-stg.hasura-app.io/v1/query"

```

#### Response

```http

{
    "affected_rows": 1,
    "returning": [
        {
            "id": 3
        }
    ]
}

```

Lets try to access the uploaded file by assuming as user 2. Please note that the `auth_token` used in the following request is the `auth_token` of user 2 created before

#### Request

```

curl -X GET -H "Authorization: Bearer 43bbd9f5eab9c9b82d17d9836e1d866a52103b0fa2e9c1c1" --output ./sample "https://filestore.h34-ballyhoo30-stg.hasura-app.io/v1/file/933470ad-feeb-4dcc-9f40-8ec4bcc7c0c1"

```

#### Response

```

$ cat sample 

> {"message":"invalid authorization token"}

```

Oops, Lets share the file with user 2. To do this add an entry in the `file_share` table with the `shared_user_id` set to the user 2's id and `user_file_id` set to the user 1's file

#### Request

```http

curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer 805daf29f8042ed2870b785db2ad69560e397174bb1a12b9" -d '{
    "type": "insert",
    "args": {
        "table": "file_share",
        "objects": [
            {
                "shared_user_id": "5",
                "user_file_id": "3"
            }
        ],
        "returning": [
            "shared_user_id",
            "user_file_id"
        ]
    }
}' "https://data.h34-ballyhoo30-stg.hasura-app.io/v1/query"

```

#### Response

```

{
    "affected_rows": 1,
    "returning": [
        {
            "shared_user_id": 5,
            "user_file_id": 3
        }
    ]
}

```

Lets try to download again

#### Request

```

curl -X GET -H "Authorization: Bearer 43bbd9f5eab9c9b82d17d9836e1d866a52103b0fa2e9c1c1" --output ./sample "https://filestore.h34-ballyhoo30-stg.hasura-app.io/v1/file/933470ad-feeb-4dcc-9f40-8ec4bcc7c0c1"

```

#### Response

```

<file content>

```

Lets open the file and check. Wooohooooo magiccc!!!
