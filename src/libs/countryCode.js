module.exports = {
    country_name: function(code) {
        const regionNames = new Intl.DisplayNames(
            ['en'], {type: 'region'});
             const country_name = regionNames.of(code);
             return country_name;
    }
}