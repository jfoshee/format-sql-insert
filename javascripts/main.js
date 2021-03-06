    var splitArgList = function (s) {
        var first_paren = s.indexOf('(') + 1;
        var opening = s.substring(0, first_paren).trim();
        var args_closing = s.substring(first_paren);
        var last_paren = args_closing.lastIndexOf(')');
        var args = args_closing.substring(0, last_paren);
        var closing = args_closing.substring(last_paren).trim();
        return [opening, args, closing];
    };
    
    var splitAndTrim = function (s) {
        // Match commas outside parens, outside single quotes, outside double quotes           
        var regex = /,(?![^(]*\))(?=(?:[^']|'[^']*')*$)(?=(?:[^"]|"[^"]*")*$)/;
        var items = s.split(regex);
        var trimmed = items.map(function (i) {
            return i.trim();
        });
        return trimmed;
    };
    
    var padLeft = function (s, newLength) {
        if (s.length >= newLength) return s;
        var padding = newLength - s.length;
        return Array(padding + 1).join(" ") + s;
    };
    
    var padByLonger = function (A, B) {
        var len = Math.min(A.length, B.length);
        for (var i = 0; i != len; ++i) {
            var a = A[i];
            var b = B[i];
            var stringLength = Math.max(a.length, b.length);
            A[i] = padLeft(A[i], stringLength);
            B[i] = padLeft(B[i], stringLength);
        }
        return [A, B];
    };
    
    var padLeftByArray = function(items, newLengths) {
        var len = Math.min(items.length, newLengths.length);
        for (var i = 0; i < len; ++i) {
            items[i] = padLeft(items[i], newLengths[i]);
        }
    };
    
    var isInteresting = function(value) {
        return !(value == '0' || value == "''" || value == '""' || 
            value == "N''" || value.toUpperCase() == "NULL");
    };

    var indexOfUninteresting = function(values, startingIndex) {
        var len = values.length;
        for (var i = startingIndex; i != len; ++i) {
            if (!isInteresting(values[i]))
                return i;
        }
        return len;
    };

    var indexOfInteresting = function(values, startingIndex) {
        var len = values.length;
        for (var i = startingIndex; i != len; ++i) {
            if (isInteresting(values[i]))
                return i;
        }
        return len;
    };

    Array.prototype.move = function(from, to) {
        this.splice(to, 0, this.splice(from, 1)[0]);
    };
    
    var moveNextInterestingValue = function(names, values, i) {
        var unx = indexOfUninteresting(values, i);
        var inx = indexOfInteresting(values, unx);
        if (inx < values.length && inx > unx) {
            values.move(inx, unx);
            names.move(inx, unx);
        }
        return [names, values];
    };

    var orderByInterestingValues = function(names, values) {
        var len = values.length;
        for (var i = 0; i != len; i++) {
            moveNextInterestingValue(names, values, i);
        }
        return [names, values];
    };
    
    var updateMaxLengths = function(A, maxLengths) {
        for (var i = 0; i < A.length; ++i) {
            if (maxLengths.length <= i || A[i].length > maxLengths[i])
                maxLengths[i] = A[i].length;
        }
    };
    
    var zip = function(arrays) {
        return arrays[0].map(function(_,i){
            return arrays.map(function(array){return array[i]});
        });
    };
    
    var sortByWeights = function(items, weights) {
        var zipped = zip([items, weights]);
        var sorted = zipped.sort(function(a,b){return -a[1] + b[1];});
        return sorted.map(function(a){return a[0];});
    };
    
    var sortByInterestingness = function(columnNames, valuesMatrix) {
        var interesting_count = [];
        for(var j = 0; j < valuesMatrix[0].length; ++j) {
            var seen = [];
            for (var i = 0; i < valuesMatrix.length; ++i) {
                if (valuesMatrix[i].length <= j)
                    break;
                if (interesting_count.length <= j) {
                    interesting_count[j] = 0;
                }
                var value = valuesMatrix[i][j];
                if (isInteresting(value) && -1 === seen.indexOf(value)) {
                    interesting_count[j]++;
                    seen.push(value);
                }
            }
        }
        var sortedColumnNames = sortByWeights(columnNames, interesting_count);
        columnNames.map(function(v,i,a) { a[i] = sortedColumnNames[i]; });
        valuesMatrix.map(function(v,i,a) { a[i] = sortByWeights(a[i], interesting_count); });
    };
    
    var findColumnWidths = function(columnNames, valuesMatrix) {
        var columnWidths = [];
        updateMaxLengths(columnNames, columnWidths);
        for (var i = 0; i < valuesMatrix.length; ++i) {
            updateMaxLengths(valuesMatrix[i], columnWidths);
        }
        return columnWidths;
    };
    
    var splitAndTrimValues = function(all_values_clauses) {
        var valuesMatrix = [];
        for (var i = 0; i < all_values_clauses.length; ++i) {
            var record_clause = all_values_clauses[i];
            var values_clause_split = splitArgList(record_clause);
            valuesMatrix[i] = splitAndTrim(values_clause_split[1]);
        }
        return valuesMatrix;
    };
    
    var recomposeInsertStatement = function(all_values_clauses, insert_clause_split, columnNames, valuesMatrix) {
        var output_insert_array = [];
        for (var i = 0; i < valuesMatrix.length; ++i) {
            var record_clause = all_values_clauses[i];
            var values_clause_split = splitArgList(record_clause);
            var opening_length = insert_clause_split[0].length;
            values_clause_split[0] = padLeft(values_clause_split[0], opening_length);
            var values_args = valuesMatrix[i];
            output_insert_array[i] = 
                values_clause_split[0] + values_args.join(', ') + values_clause_split[2];
        }
        var output_insert = output_insert_array.join(',\n');
        var output = insert_clause_split[0] + columnNames.join(', ') + insert_clause_split[2] + '\n' +
            output_insert;
        return output;
    };
    
    var padColumnNamesAndValues = function(columnNames, valuesMatrix, columnWidths) {
        padLeftByArray(columnNames, columnWidths);
        for (var i = 0; i < valuesMatrix.length; ++i) {
            padLeftByArray(valuesMatrix[i], columnWidths);
        }
    };
    
    var formatInsertStatement = function(sql) {
        var insert_index = sql.toUpperCase().indexOf('VALUES');
        var insert_clause = sql.substring(0, insert_index);
        var values_clause = sql.substring(insert_index);
        var all_values_clauses = splitAndTrim(values_clause);
        var insert_clause_split = splitArgList(insert_clause);
        var columnNames = splitAndTrim(insert_clause_split[1]);
        var valuesMatrix = splitAndTrimValues(all_values_clauses);
        sortByInterestingness(columnNames, valuesMatrix);
        var columnWidths = findColumnWidths(columnNames, valuesMatrix);
        padColumnNamesAndValues(columnNames, valuesMatrix, columnWidths);
        var output = recomposeInsertStatement(
            all_values_clauses, insert_clause_split, columnNames, valuesMatrix);
        return output;
    };
    
    var formatAllInsertStatements = function(sql) {
        var insertRegex = /INSERT.*\s*VALUES\s*\(.*\)(,\s*\(.*\))*/igm;
        return sql.replace(insertRegex, function(match) {
            return formatInsertStatement(match);
        });
    };


var setupSqlInsertFormatter = function() {
    $('#output').text('Ready');    
    $('#format').click(function () {
        var sql = $('#sql').val();
        var output = formatAllInsertStatements(sql) + "\n";
        $('#output').text(output);
    });
};
