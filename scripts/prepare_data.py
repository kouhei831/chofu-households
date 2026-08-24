"""Create the browser-ready Tama-city comparison dataset from SSDSE-A-2026."""

from __future__ import annotations

import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "raw" / "SSDSE-A-2026.csv"
OUTPUT = ROOT / "public" / "data" / "tama-single-households.csv"


def main() -> None:
    with SOURCE.open(encoding="cp932", newline="") as stream:
        rows = list(csv.reader(stream))

    header = rows[0]
    index = {name: header.index(name) for name in ("A710101", "A810105")}
    cities: list[dict[str, object]] = []

    # SSDSE uses three metadata rows before the municipality observations.
    for row in rows[3:]:
        if len(row) != len(header) or row[1] != "東京都" or not row[2].endswith("市"):
            continue

        general = int(row[index["A710101"]])
        single = int(row[index["A810105"]])
        if general <= 0 or single < 0:
            raise ValueError(f"Invalid household counts for {row[2]}")

        cities.append(
            {
                "code": row[0],
                "city": row[2],
                "generalHouseholds": general,
                "singleHouseholds": single,
                "singleShare": single / general * 100,
            }
        )

    if len(cities) != 26:
        raise ValueError(f"Expected Tokyo's 26 cities, found {len(cities)}")

    by_share = sorted(cities, key=lambda d: float(d["singleShare"]), reverse=True)
    by_count = sorted(cities, key=lambda d: int(d["singleHouseholds"]), reverse=True)
    share_rank = {str(d["city"]): rank for rank, d in enumerate(by_share, 1)}
    count_rank = {str(d["city"]): rank for rank, d in enumerate(by_count, 1)}

    chofu = next(d for d in cities if d["city"] == "調布市")
    assert chofu["generalHouseholds"] == 120_790
    assert chofu["singleHouseholds"] == 57_424

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("w", encoding="utf-8", newline="") as stream:
        fieldnames = [
            "code",
            "city",
            "generalHouseholds",
            "singleHouseholds",
            "singleShare",
            "shareRank",
            "countRank",
        ]
        writer = csv.DictWriter(stream, fieldnames=fieldnames)
        writer.writeheader()
        for city in by_share:
            output_row = dict(city)
            output_row["singleShare"] = f'{float(city["singleShare"]):.6f}'
            output_row["shareRank"] = share_rank[str(city["city"])]
            output_row["countRank"] = count_rank[str(city["city"])]
            writer.writerow(output_row)


if __name__ == "__main__":
    main()
