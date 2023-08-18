def progress_bar(i, x):
    print("|", "|" * (50 * i // x), round(100 * i / x, 2), "%\r", end='')
