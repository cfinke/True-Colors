rm -rf .tmp_xpi_dir/

chmod -R 0777 true-colors/

mkdir .tmp_xpi_dir/
cp -r true-colors/* .tmp_xpi_dir/

rm -rf `find ./.tmp_xpi_dir/ -name ".DS_Store"`
rm -rf `find ./.tmp_xpi_dir/ -name "Thumbs.db"`
rm -rf `find ./.tmp_xpi_dir/ -name ".git"`

cd .tmp_xpi_dir/chrome/
zip -rq ../true-colors.jar *
rm -rf *
mv ../true-colors.jar ./
cd ../
zip -rq ~/Desktop/true-colors.xpi *
cd ../
rm -rf .tmp_xpi_dir/