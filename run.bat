set CUR_MM=%date:~4,1%
set CUR_DD=%date:~7,2%

set SUBFILENAME=%CUR_MM%_%CUR_DD%

node index --force-update  >>  log/%SUBFILENAME%.log
