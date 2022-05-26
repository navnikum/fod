#!/bin/sh

function help() {
	echo "Usage: " $0 -l -d n
	echo "\t-l\t Generate a certificate for localhost"
	echo "\t-d n\t Certificate validity in number days"
}

CDAYS=500

while getopts d:l OPTNAME; do
	case $OPTNAME in
		l) SAN="DNS:localhost";;
		d) CDAYS=$OPTARG;;
		?) help; exit 1;;
	esac
done


CHOSTNAME=${CHOSTNAME:-$(hostname -f)}
CDNSDOMAINNAME=${CDNSDOMAINNAME:-$(hostname -f | sed s/^$(hostname -s)//)}

CERT=cert.pem
KEY=key.pem

if [ x$SAN == x ]; then
    if [ x$CDNSDOMAINNAME == x ]; then
	    SAN="DNS:"$CHOSTNAME
    else
	    SAN="DNS:"$CHOSTNAME",DNS:*."$CDNSDOMAINNAME
    fi
fi

echo "
[req]
prompt = no
distinguished_name = dn
x509_extensions = ext
[dn]
O = Oracle
C = US
ST = CA
L = Redwood City
OU = Design
[ext]
subjectAltName = "$SAN > $CERT.cnf

openssl genpkey -algorithm rsa -pkeyopt rsa_keygen_bits:2048 -out $KEY 2> /dev/null
openssl req -new -config $CERT.cnf -key $KEY -x509 -days $CDAYS -out $CERT -outform pem

#openssl x509 -text -in $CERT.pem -noout

rm -f $CERT.cnf


