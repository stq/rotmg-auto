ROTMG daily updater based on NRelay

Features:

* Automatic version update, taken from decompiled flash file
* Automatic daily login rewards


Hints:
* Install with `npm i` and `npm i typescript -g`
* Compile with `tsc`
* Setup acc-config.json as described in nrelay docs, just without buildVersion ( https://github.com/thomas-crane/nrelay/blob/master/acc-config-sample.json )
* Use task scheduler to run 'run.bat' on daily basis. Make sure to run at least once manually to check it works. **Make sure it's set to run in script's folder.**
* Setup BIOS power options to auto start when computer power surge happens
* Check /log if something is wrong
* Setup on backup computer(s) if you plan to go for vacation or long absence (just use different scheduler time, at least 20 min away from previous computer)
* Run max for 5 accounts. If you have more then 5 accounts, it's prefferable to setup another instance and run in another day time.


Plans:
remove TS BS


***
Made with passionate hate to DECA


***
All regards to nrelay author, even if he is TS BS fan

Also regards to daily login plugin author
