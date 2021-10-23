cd ./python
o=0
for i in $*
do
	array[$o]=$i
#	echo "${array[$o]}"
	o=`expr $o + 1`
done

python3 "${array[0]}" "${array[1]}" ${array[2]}
