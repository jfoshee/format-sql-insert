test( "padLeft 5", function() {
    equal(padLeft("J", 5), "    J");
});

test( "First non-zero", function() {
    var items = [ "0", "0", "0", "Foo", "Bar" ];
    equal(indexOfInteresting(items, 1), 3);
});

test( "First zero", function() {
   var items = [ "A", "yada", "yada", "y", "0", "*" ];
   equal(indexOfUninteresting(items, 2), 4);
});

test( "Move interesting to beginning", function() {
    var names =  [ "A", "B", "C"];
    var values = [ "0", "0", "1" ];
    moveNextInterestingValue(names, values, 0);
    deepEqual(names,  ["C", "A", "B" ]);
    deepEqual(values, ["1", "0", "0" ]);
});

test( "Move next interesting to beginning", function() {
    var names =  [ "A", "B", "C", "D", "E"];
    var values = [ "1", "0", "0", "2", "3" ];
    moveNextInterestingValue(names, values, 1);
    deepEqual(names,  [ "A", "D", "B", "C", "E"]);
    deepEqual(values, [ "1", "2", "0", "0", "3" ]);
});

test( "Move all interesting to beginning", function() {
    var names =  [ "A", "B",  "C", "D", "E",   "F",    "G", "H", "I"];
    var values = [ "0", "1", "''", "2", "3", "N''", "Null", "4", "0" ];
    orderByInterestingValues(names, values);
    deepEqual(names,  [ "B", "D", "E", "H", "A",  "C",   "F",    "G", "I"]);
    deepEqual(values, [ "1", "2", "3", "4", "0" ,"''", "N''", "Null", "0" ]);
});

test( "Format unusual casing and spacing", function() {
    var sql = "Insert Into MyTable  (Initials, Num) \n  Values  ('JF', 12345);"
    var formatted = formatAllInsertStatements(sql);
    equal(formatted, "Insert Into MyTable  (Initials,   Num)\n             Values  (    'JF', 12345);" )
});
