npm run build
rm -rf ~/webhh/src/main/resources/static/vue-admin/*
rm ~/webhh/src/main/resources/static/index.html
cp -r dist/static ~/webhh/src/main/resources/static/vue-admin/
cp  dist/index.html  ~/webhh/src/main/resources/static/
