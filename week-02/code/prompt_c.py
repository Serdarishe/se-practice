Remaining assumptions:

marks must be a list or iterable containing only int or float values.
Boolean values (True, False) are not treated as valid marks because they are not meaningful grades.
pass_rate is returned as a percentage rounded to 2 decimal places.
pass_mark must also be between 0 and 100.
def analyze_marks(marks, pass_mark=50):
    if not isinstance(marks, list) or len(marks) == 0:
        raise ValueError("Marks list cannot be empty")

    if not isinstance(pass_mark, (int, float)) or isinstance(pass_mark, bool):
        raise ValueError("Invalid pass mark")

    if pass_mark < 0 or pass_mark > 100:
        raise ValueError("Pass mark must be between 0 and 100")

    for mark in marks:
        if not isinstance(mark, (int, float)) or isinstance(mark, bool):
            raise ValueError("Marks must contain only numeric values")

        if mark < 0 or mark > 100:
            raise ValueError("Marks must be between 0 and 100")

    average = sum(marks) / len(marks)
    highest = max(marks)
    lowest = min(marks)

    passed = sum(1 for mark in marks if mark >= pass_mark)
    pass_rate = (passed / len(marks)) * 100

    return {
        "average": round(average, 2),
        "highest": highest,
        "lowest": lowest,
        "pass_rate": round(pass_rate, 2)
    }


# Tests

# Example test
print(analyze_marks([40, 60, 80], 50))
# Output: {'average': 60.0, 'highest': 80, 'lowest': 40, 'pass_rate': 66.67}


# One mark
print(analyze_marks([75]))
# Output: {'average': 75.0, 'highest': 75, 'lowest': 75, 'pass_rate': 100.0}


# Decimal values
print(analyze_marks([55.5, 70.2, 80.3]))
# Output: {'average': 68.67, 'highest': 80.3, 'lowest': 55.5, 'pass_rate': 100.0}


# Custom pass mark
print(analyze_marks([40, 60, 80], 70))
# Output: {'average': 60.0, 'highest': 80, 'lowest': 40, 'pass_rate': 33.33}


# Empty list
try:
    analyze_marks([])
except ValueError as e:
    print(e)


# Text value
try:
    analyze_marks([50, "60", 70])
except ValueError as e:
    print(e)


# Below 0
try:
    analyze_marks([50, -10, 70])
except ValueError as e:
    print(e)


# Above 100
try:
    analyze_marks([50, 110, 70])
except ValueError as e:
    print(e)

Short explanation:

The function first validates the input list, pass_mark, and every mark.
It calculates average using sum / length, finds highest and lowest values with max() and min().
pass_rate is calculated as the percentage of marks greater than or equal to pass_mark.
Invalid inputs raise ValueError as required.