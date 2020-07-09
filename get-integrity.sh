function sha() { # usage: sha FILENAME.js
  tempShaOutput=$(cat $1 | openssl dgst -sha384 -binary | openssl base64 -A)
  echo sha384-$tempShaOutput
}

sha flying-focus.js
