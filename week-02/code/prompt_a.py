If you need a simple Python function analyze_marks(marks, pass_mark=50) that returns average, highest, lowest, and pass rate:

def analyze_marks(marks, pass_mark=50):
    if not marks:
        return {
            "average": 0,
            "highest": None,
            "lowest": None,
            "pass_rate": 0
        }

    average = sum(marks) / len(marks)
    highest = max(marks)
    lowest = min(marks)

    passed = sum(1 for mark in marks if mark >= pass_mark)
    pass_rate = (passed / len(marks)) * 100

    return {
        "average": average,
        "highest": highest,
        "lowest": lowest,
        "pass_rate": pass_rate
    }


# Example
marks = [75, 40, 90, 55, 30]

result = analyze_marks(marks)

print(result)

Output:

{
 'average': 58.0,
 'highest': 90,
 'lowest': 30,
 'pass_rate': 60.0
}

Logic:

average → sum of all marks / number of students
highest → maximum mark
lowest → minimum mark
pass_rate → percentage of students with mark ≥ pass_mark