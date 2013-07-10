var setupSqlInsertFormatter = function() {
        
    $('#output').text('Ready');

    var splitArgList = function (s) {
        var first_paren = s.indexOf('(') + 1;
        var opening = s.substring(0, first_paren).trim();
        var args_closing = s.substring(first_paren);
        var last_paren = args_closing.lastIndexOf(')');
        var args = args_closing.substring(0, last_paren)
        var closing = args_closing.substring(last_paren).trim();
        return [opening, args, closing];
    };
    
    var splitAndTrim = function (s) {
        var items = s.split(',');
        var trimmed = items.map(function (i) {
            return i.trim()
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
    
    $('#format').click(function () {
        var sql = $('#sql').val();
        var insert_index = sql.indexOf('VALUES');
        var insert_clause = sql.substring(0, insert_index);
        var values_clause = sql.substring(insert_index);
        var insert_clause_split = splitArgList(insert_clause);
        var insert_args = splitAndTrim(insert_clause_split[1]);
        var values_clause_split = splitArgList(values_clause);
        var values_args = splitAndTrim(values_clause_split[1]);
        padByLonger(insert_args, values_args);
        var opening_length = insert_clause_split[0].length;
        values_clause_split[0] = padLeft(values_clause_split[0], opening_length);
        var output = insert_clause_split[0] + insert_args.join(', ') + insert_clause_split[2] + '\n' + values_clause_split[0] + values_args.join(', ') + values_clause_split[2];
        $('#output').text(output);
    });
}
