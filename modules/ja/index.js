
module.exports = async(builder, docDir, common) => {

    const listPage = ($) => {
        const result = [];
        const entries = $("table.a-table.a-table.a-table.tablesorter tbody tr");
        
        entries.each((i, elem) => {
            const td = $(elem).find("td").get(0);
            const url = $(td).find("a.a-link").attr("href");
            const name = $(td).text().trim();
            
            result.push({
                name: name,
                url: url
            });
        });

        console.log(result);
        return result;
    };

    const dataPage = ($, builder) => {

    };

    builder.hero("https://game8.jp/epic-seven/301575", listPage, dataPage);
};