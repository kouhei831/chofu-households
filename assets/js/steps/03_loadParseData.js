/* --- データセット --- */
const dataAll = {cities: [], history: []};

async function loadParseData() {
    const files = await Promise.all([
        d3.csv("assets/data/tama-single-households.csv", function(d) {
            return {
                code: d.code,
                city: d.city,
                generalHouseholds: Number(d.generalHouseholds),
                singleHouseholds: Number(d.singleHouseholds),
                singleShare: Number(d.singleShare),
                shareRank: Number(d.shareRank),
                countRank: Number(d.countRank)
            };
        }),
        d3.csv("assets/data/chofu-household-history.csv", function(d) {
            return {
                year: Number(d.year),
                coupleOnly: Number(d.coupleOnly),
                coupleWithChildren: Number(d.coupleWithChildren),
                singleParent: Number(d.singleParent),
                single: Number(d.single),
                other: Number(d.other)
            };
        })
    ]);

    dataAll.cities = files[0];
    dataAll.history = files[1].sort(function(a, b) {
        return d3.ascending(a.year, b.year);
    });
}
