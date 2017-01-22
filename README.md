# What is this script?

Fetch Publishdate from 新刊ネット (http://sinkan.net/) and send your slack at scheduled day. 

# Test the script

1) Run below code from the Terminal:

    $ node test.js

2) You can fetch data from "新刊ネット (http://sinkan.net/)" and console log if you prefer.


# deploy to AWS Lambda

1) zip "index.js" and "node_modules".

2) Create AWS Lambda function at https://ap-northeast-1.console.aws.amazon.com/lambda/.

3) Chose "Upload a .zip file" at Code entry type and upload zip file.

4) Configure schedule event and Finished!!!
