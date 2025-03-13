# How to run server side
npm install

# set .env file according to DB connection parameters

# then on empty Database run the following commands
npm run migrate
npm run seed

# above command will create tables, and 1 record for Admin table to use as Login credentials

# run file server / it should be installed on environment 1st
minio server ~/minio/data

# finally
npm run dev