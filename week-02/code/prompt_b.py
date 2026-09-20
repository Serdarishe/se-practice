def analyze_marks(marks, pass_mark=50):
    if not marks:
        raise ValueError("Marks list cannot be empty")

    for mark in marks:
        if not isinstance(mark, (int, float)):
            raise ValueError("Marks must be numeric values")
        if mark < 0 or mark > 100:
            raise ValueError("Marks must be between 0 and 100")

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

Explanation:
The function validates the input list first. It checks that the list is not empty, all values are numeric, and marks are within the range 0–100. Then it calculates the average, maximum mark, minimum mark, and percentage of students who passed based on pass_mark. The results are returned as a dictionary.