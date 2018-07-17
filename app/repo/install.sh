curl -s https://deb.siderus.io/key.asc | sudo apt-key add -
echo "deb https://deb.siderus.io/ $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/siderus.list

