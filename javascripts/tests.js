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

test( "Move interesting to beginning in sql statement", function() {
    var sql = "INSERT tbl (Baz, Foo, Bar) VALUES ('', 'JF', 123);"
    var formatted = formatAllInsertStatements(sql);
    ok(formatted.indexOf(" Foo, Bar, Baz") > 0, formatted);
    ok(formatted.indexOf("'JF', 123,  ''") > 0, formatted);
});

test( "Format unusual casing and spacing", function() {
    var sql = "Insert Into MyTable  (Initials, Num) \n  Values  ('JF', 12345);"
    var formatted = formatAllInsertStatements(sql);
    equal(formatted, "Insert Into MyTable  (Initials,   Num)\n             Values  (    'JF', 12345);" )
});

test( "Tolerate commas in Decimal values", function() {
    var values_args = "CAST(1.23 AS Decimal(5, 2)), 'abc'";
    var split = splitAndTrim(values_args);
    deepEqual(split, ["CAST(1.23 AS Decimal(5, 2))", "'abc'"]);
});

test( "Tolerate commas in single quoted string", function() {
    var values_args = "'1,2', 'abc'";
    var split = splitAndTrim(values_args);
    deepEqual(split, ["'1,2'", "'abc'"]);
});

test( "Tolerate commas in double quoted string", function() {
    var values_args = '"1,2", "abc"';
    var split = splitAndTrim(values_args);
    deepEqual(split, ['"1,2"', '"abc"']);
});

test( "Tolerates more values than columns", function() {
    var sql = "INSERT tbl (A, B)  VALUES (1, 2, 3)";
    equal(formatInsertStatement(sql), "INSERT tbl (A, B)\n    VALUES (1, 2, 3)");
});

test( "Tolerates more columns than values", function() {
    var sql = "INSERT tbl (A, B, C)  VALUES (1, 2)";
    equal(formatInsertStatement(sql), "INSERT tbl (A, B, C)\n    VALUES (1, 2)");
});

test( "Handle multiple values clauses for multi-record insert", function() {
    var sql = "INSERT tbl (Col1, Col2)  VALUES (10, 2000), (30000, 4) ";
    equal(formatInsertStatement(sql), 
        "INSERT tbl ( Col1, Col2)\n" +
        "    VALUES (   10, 2000),\n" +
        "           (30000,    4)");
});

test( "Order by interesting for multiple records", function() {
    var sql = "INSERT tbl (C, A, D, B)  VALUES (0, 10, NULL, '')," +
    "('', 0, 0, 'Foo') ";
    equal(formatInsertStatement(sql), 
        "INSERT tbl ( A,     B,  C,    D)\n" +
        "    VALUES (10,    '',  0, NULL),\n" +
        "           ( 0, 'Foo', '',    0)");
});

test( "Changing values considered more interesting", function() {
    var sql = "INSERT tbl (D, B, C, A)  VALUES " + 
    "(0, 0, 1, 2)," +
    "(0, 10, 1, 3)," +
    "(0, 20, 1, 4)," +
    "(0, 0, 1, 5)";
    equal(formatInsertStatement(sql), 
        "INSERT tbl (A,  B, C, D)\n" +
        "    VALUES (2,  0, 1, 0),\n" +
        "           (3, 10, 1, 0),\n" +
        "           (4, 20, 1, 0),\n" +
        "           (5,  0, 1, 0)");
});

// TODO: Handle multiple record insertion with mixed lengths

