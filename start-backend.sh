export WAITFORIT_HOST=oap-mongo
export WAITFORIT_PORT=27027

while :
do
  nc -z $WAITFORIT_HOST $WAITFORIT_PORT
  WAITFORIT_result=$?
  if [[ $WAITFORIT_result -eq 0 ]]; then
    echo "$WAITFORIT_HOST:$WAITFORIT_PORT is up"
    break
  fi
  sleep 1
  echo "retrying $WAITFORIT_HOST:$WAITFORIT_PORT"
done
echo $WAITFORIT_result

exec npm run start:prod