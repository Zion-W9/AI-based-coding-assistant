import argparse
import gdown


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--field', type=str, help='link field')
    parser.add_argument('--output', type=str, help='file output')
    args = parser.parse_args()
    print(f'Downloading {args.output}')
    gdown.download(id=args.field, output=args.output, quiet=False)


if __name__ == "__main__":
    main()
