#!/bin/bash

#while true; do
#    inotifywait -e modify /root/Templates/editablefile.txt
#    /root/Templates/myscript.sh
#done


#!/bin/bash

nohup bash -c "
while true; do
    inotifywait -e modify /root/ansible/hosts
    /root/nodews/project2/src/scripts/myscript.sh
done" &
