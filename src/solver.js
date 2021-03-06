/*	expr is all others things than v like:
	expr: {
		type: '+',
		left: {
			[...]
		},
		right: {
			[...]
		}
	}
*/
const check_expression = (expr, rules) => {
	if (expr.type == '!')
		return (!check_needed(expr.value, rules));
	else
	{
		let left = check_needed(expr.left, rules);
		let right = check_needed(expr.right, rules);
		switch (expr.type)
		{
			case '+':
				return (left && right);
			case '|':
				return (left || right);
			case '^':
				return (left ? !right : right);
		}
	}
}

/*	needed is left part of implies or smthg in expr like:
	[A + B =>] or [A =>] or [A] or [A + B] in expr
*/
const check_needed = (needed, rules) => {
	let result;

	if (needed.type != 'v') // [A + B =>]
		result = check_expression(needed, rules);
	else
		result = query_solution(needed.value, rules);
	return (result);
}

/*
	[=> A + B] // if given contain query
*/
const given_contain_query = (given, query) => {
	let result = {
		value: false, 
		not: 0
	};

	if (given.type == '!')
	{
		result = given_contain_query(given.value, query);
		result.not++;
	}
	else if (given.type != 'v')
	{
		result = given_contain_query(given.left, query);
		result2 = given_contain_query(given.right, query);
		if (result.value && result2.value && result.not % 2 != result2.not % 2)
			throw "Error like [=> A + !A]";
		else if (!result.value)
			result = result2;
	}
	else if (given.value === query)
		result.value = true;
	else
		result.value = false;
	return (result);
}

/*	query = 'A' // only 1 query at a time */
const query_solution = (query, rules) => {
	let result;
	let contain;

	if (query.value != null)
		result = query.value;
	rules.forEach((rule) => {
		if (!rule.hash.includes(query.label) || rule.hash == "default")
		{
			if (rule.hash == "default")
				rule.hash = query.label;
			else
				rule.hash = rule.hash.concat(query.label);
			contain = given_contain_query(rule.given, query, rules);
			if (contain.value)
			{
				let result2;
				result2 = check_needed(rule.needed, rules);
				if (!result2) // [A + B =>] False
					result2 = null;
				else if (contain.not % 2)
					result2 = !result2;
				if (result != null && result2 != null && (result && !result2 || !result && result2)	)
					throw "Error: "+ query.label + " can't have different values";
				else if (result == null || !result) 
					result = result2
			}
		}
	});
	if (query.value == null && result == null)
		result = false;
	if (result)
		query.value = result;
	return (result);
}

module.exports = query_solution;
