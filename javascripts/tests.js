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
