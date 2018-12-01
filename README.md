# Shop365
Final project for CS365

Created by Nick Matonich, Ryan Salo, and Nate Santti

Shop365 is a shopping list app meant for people to keep track of their items within groups. We define a group as a collection of people. To use, simply select the group you'd like to see the items for and go from there.

## To setup Shop365, start by cloning this git repository. Then make sure [mongodb](https://www.mongodb.com/download-center/community) is setup properly.

It should be fairly straightforward to set up your shop365 database.

* First, you need to find the mongo.exe file, if you followed all the defaults when installing it should be at this path C:\Program Files\MongoDB\Server\4.0\bin.

This will open up the shell.

* To create a database, type the following and hit enter...use shop365

This should say it's switched to that DB, however, it really isn't created until you create a collection.

* Then...type the following and hit enter...
db.createCollection("items")

The shell should return this...
{ "ok" : 1 }

* Type the following and hit enter...
show collections

It should respond with...
items

* To leave the shell, type 'exit' and hit enter or close out of the window. MongoDB should be running as a service if you installed it correctly, so there is no need to fire up the shell when using Shop365

This should be all you need to get it working.

