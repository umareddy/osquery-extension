# osquery-extension
#Overview
This software module enables one to add table plugins to OSQuery. The data for the new tables could come from many sources, for example:
1. Data could come from invoking operating system API calls
2. Data could come from making a REST API call to an external server
3. The data could come from a log file

You could perform joins between OSQuery base tables and the extension tables to obtain unique insights into your infrastructure.

The extension + table plugin concept can quickly enable the integration of data which is not yet available as a part of base OSQuery. If you could write a REST service on a Windows server then the Windows OS related infromaion can be quickly made availabe under an OSQuery prompt.

#Prerequisites
OSQuery must be installed on the computer you are running this sogtware. OSQuery should be run as the same user the user which runs the commands shown here.

#How to

Open two terminal windows

On terminal - 1 run the following commands
```
git clone https://github.com/umareddy/osquery-extension.git
cd osquery-extension
npm install
```
On terminal 2 type the following commands
```
osqueryi
select * from osquery_extensions;
```
Note the value in the path column (for the row where name = 'core'), this is the UNIX Domain socket to use to communicate with this osqueryi instance.

On terminal 1 type the following command

```
node extension.js <cut and paste the socket path here>
```

On terminal 1 run the following commands

```
.tables
select * from test_table_001;
select * from HERO_FOUNDERS;
```

You should see the two new tables that are part of OSQuery.

You can edit the the file extensions.js to add additional tables.

This example shows how one could write a process to programatically run sql commands and retrieve responses in JSON format. You could use this approach to provide a REST interface to OSQuery tables.

Open another terminal window and type the follwoing commands:

```
node query.js <cut and paste the socket path here>
select * from processes;
```
