# Share-It: file-sharing-app

This project builds a backend for a simple file storage application using the out of the box Hasura backend API's viz Data API's, Auth API's, File Store API's

## Introduction

This quickstart project comes with the following by default:

1. A basic hasura project
2. Three tables `user`, `user_file` and `file_share`
3. A nodejs-express application which hosts the logic to grant user the access to the file or not

## Description

This project comes with three tables namely `user`, `user_file` and `file_share` and a nodejs-express application

1. The `user` table stores the application user information like email etc. 
2. The `user_file` table stores the uploaded files info of the user
3. The `file_share` table stores the shared information of the file, like who it is shared and what not.


## Quickstart

Follow this section to get this project working. Before you begin, ensure you have the latest version of hasura cli tool installed.

### Step 1: Getting the project

```sh
$ hasura quickstart karthik/file-sharing-app
$ cd karthik/file-sharing-app
```

The above command does the following:
1. Creates a new folder in the current working directory called `karthik/file-sharing-app`
2. Creates a new trial hasura cluster for you and sets that cluster as the default cluster for this project
3. Initializes `karthik/file-sharing-app` as a git repository and adds the necessary git remotes.

### Step 2: Getting cluster information

Every hasura project is run on a Hasura cluster. To get details about the cluster this project is running on:

```sh
$ hasura cluster status
```

This will give you your cluster status like so

```sh
INFO Status:                                      
Cluster Name:       h34-excise98-stg
Cluster Alias:      hasura
Kube Context:       h34-excise98-stg
Platform Version:   v0.15.3
Cluster State:      Synced
```

Keep a note of your cluster name. Alternatively, you can also go to your [hasura dashboard](https://dashboard.hasura.io) and see the clusters you have.

### Step 3: Deploying on a hasura cluster

```sh
$ git add .
$ git commit -m "Initial Commit"
$ git push hasura master
```

## Configuring the file store API

File APIs on Hasura lets users upload and store files on a Hasura project and also download when required. The API exposes upload, download and delete methods as well as provide permission options based on user’s ID or Role to decide who can create, read or delete files.

It comes with three default hook urls readily available to be used with any project. Checkout [https://docs.hasura.io/0.15/manual/files/permission.html](link) for more info

Since our logic is entirely dependent on our database state(Who owns the file and who it is shared with), we will write our own custom hook. 
This quickstart project consists of a nodejs-express application which implements this custom hook. 


## Demo

To test this application, lets create two users as follows

User can be created by using Hasura Auth API's as follows. Checkout [this](https://docs.hasura.io/0.15/manual/users/index.html) link to know more about Hasura Auth API's

###To create user 1

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

Lets try to access the uploaded file by assuming as user 2. Please note the `auth_token` used in the following request is the `auth_token` of user 2 created before

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
