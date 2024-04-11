# ssh -i ~/.ssh/id_rsa -N -L 6378:xxxx:6379 username@middleServerip
localPort=$1
targetRedis=$2
middleUserAndServer=$3

ssh -i ~/.ssh/id_rsa -N -L $1:$2 $3