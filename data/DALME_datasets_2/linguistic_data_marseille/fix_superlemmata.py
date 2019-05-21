import csv

def fix():
    # open old csv
    r = csv.reader(open('pos_superlemmata_original.csv'))
    lines = list(r)

    # fill in missing values using values from line above
    for i in range(1, len(lines)):
        previous_line = lines[i-1]
        current_line = lines[i]
        if current_line[2] == "":
            current_line[2], current_line[3] = previous_line[2], previous_line[3]

    # write to new csv
    w = csv.writer(open('pos_superlemmata.csv', 'w'))
    w.writerows(lines)


def main():
    fix()

if __name__ == "__main__":
    main()