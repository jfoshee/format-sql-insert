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
        var regex = /,(?![^(]*\))(?=(?:[^']|'[^']*')*$)/;
        var items = s.split(regex);
        var trimmed = items.map(function (i) {
            return i.trim();
        });
        return trimmed;
    }
    
    var padLeft = function (s, newLength) {
        if (s.length >= newLength) return s;
        var padding = newLength - s.length;
        return Array(padding + 1).join(" ") + s;
    }
    
    var padByLonger = function (A, B) {
        var len = A.length;
        for (var i = 0; i != len; ++i) {
            var a = A[i];
            var b = B[i];
            var stringLength = Math.max(a.length, b.length);
            A[i] = padLeft(A[i], stringLength);
            B[i] = padLeft(B[i], stringLength);
        }
        return [A, B];
    }
    
    var isInteresting = function(value) {
        return !(value == '0' || value == "''" || 
            value == "N''" || value.toUpperCase() == "NULL");
    }

    var indexOfUninteresting = function(values, startingIndex) {
        var len = values.length;
        for (var i = startingIndex; i != len; ++i) {
            if (!isInteresting(values[i]))
                return i;
        }
        return len;
    }

    var indexOfInteresting = function(values, startingIndex) {
        var len = values.length;
        for (var i = startingIndex; i != len; ++i) {
            if (isInteresting(values[i]))
                return i;
        }
        return len;
    }

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
    }
    
    var formatInsertStatement = function(sql) {
        var insert_index = sql.toUpperCase().indexOf('VALUES');
        var insert_clause = sql.substring(0, insert_index);
        var values_clause = sql.substring(insert_index);
        var insert_clause_split = splitArgList(insert_clause);
        var insert_args = splitAndTrim(insert_clause_split[1]);
        var values_clause_split = splitArgList(values_clause);
        var values_args = splitAndTrim(values_clause_split[1]);
        orderByInterestingValues(insert_args, values_args);
        padByLonger(insert_args, values_args);
        var opening_length = insert_clause_split[0].length;
        values_clause_split[0] = padLeft(values_clause_split[0], opening_length);
        var output = insert_clause_split[0] + insert_args.join(', ') + insert_clause_split[2] + '\n' +
                     values_clause_split[0] + values_args.join(', ') + values_clause_split[2];
        return output;
    }
    
    var formatAllInsertStatements = function(sql) {
        var insertRegex = /INSERT.*\s*VALUES\s*\(.*\)/igm;
        return sql.replace(insertRegex, function(match) {
            return formatInsertStatement(match);
        });
    }


var setupSqlInsertFormatter = function() {
    $('#output').text('Ready');    
    $('#format').click(function () {
        var sql = $('#sql').val();
        var output = formatAllInsertStatements(sql) + "\n";
        $('#output').text(output);
    });
}
