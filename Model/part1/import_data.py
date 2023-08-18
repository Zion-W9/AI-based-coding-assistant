# input: dataset path
# output: a list of code snippets
import json
import os


def import_data(path):
    # path = 'dataset/'
    filenames = os.listdir(path)
    print("================================================================================================")
    print("importing data...")
    print("Number of Files:", len(filenames))

    data = []
    for filename in filenames:
        with open(path + filename) as f:
            for jsonObj in f:
                data_dict = json.loads(jsonObj)
                data.append(data_dict["code"])

    # for code in Data:
    #     print("------------------------------------------------------------------------------------------------")
    #     print(code)

    print("================================================================================================")
    print("Data import done!")
    print("Data Size:", len(data))
    print("================================================================================================")
    return data
