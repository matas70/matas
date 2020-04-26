function initPressPage() {
    if (compatibleDevice() && !checkIframe()) {
        window.location.replace(window.location.href.substr(0, window.location.href.lastIndexOf('/')));
    } else {
        loadAircrafts((pAircrafts) => {
            aircrafts = pAircrafts; //.filter((aircraft) => aircraft.name !== 'כחל');
            loadRoutes((routes) => {
                this.routes = routes;
                loadCategories(function () {
                    updateLocationsMap(aircrafts);
                    $(".base-table-list").html(createBasesTables());
                    $("#hospital-table-list").html(createCategoryTables("hospital"));
                    $("#city-table-list").html(createCityTables());
                });
            }, this);
        }, this);
    }
}

function createCategoryTables(category) {
    let categoryLocations = locations.filter((location) => {
        return location.type === category;
    });

    if (categoryLocations.length > 0) {        
        $(`#${category}-container`).show();
        let categoryTables = "";
        categoryLocations.forEach((categoryLocation) => {
            categoryTables += createCategoryTable(category, categoryLocation);
        });

        return categoryTables;
    } else {  
        $(`#${category}-container`).hide();      
        return "";
    }
}

function createBasesTables() {
    let bases = locations.filter((location) => {
        return location.type === "base";
    });

    if (bases.length > 0) {        
        $("#base-container").show();
        let baseTables = "";
        bases.forEach((base) => {
            baseTables += createBaseTable(base);
        });

        return baseTables;
    } else {  
        $("#base-container").hide();      
        return "";
    }
}

function createCityTables() {
    let cities = locations.filter((location) => {        
        return location.type === undefined;
    }).sort((city1, city2) => {
        return city1.pointName > city2.pointName ? 1 : city1.pointName < city2.pointName ? -1 : 0;
    });
    let cityTables = "";
    cities.forEach((city) => {
        if (city.aircrafts.length > 0 && !city.hidden) {
            cityTables += createCityTable(city);
        }
    });
    return cityTables;
}

function createBaseTable(base) {        
    return `<div class="base-table">
                <div id="location-${base.pointId}" class="base-card">
                    ${createBaseTableTitle(base.pointName, base.activeTimes, false)}
                </div>
                <div class="base-table-body">
                    ${createTableCategories(categories, base.aircrafts, base.exhibitions, "base")}
                </div>
                <div class="base-table-end"></div>
            </div>`;
}

function createCityTable(city) {
    hasAerobatic = city.aircrafts.filter((aircraft) => aircraft.specialInAircraft).length > 0;
    return `<div class="city-table">
                <div id="location-${city.pointId}" class="base-card">
                    ${createBaseTableTitle(city.pointName, city.aircrafts[0].time.substr(0, 5), hasAerobatic)}
                </div>
                <div class="base-table-body">
                    ${createTableCategory("מטס", city.aircrafts, "city")}
                </div>
            </div>`;
}

function createCategoryTable(category, categoryLocation) {
    hasAerobatic = categoryLocation.aircrafts.filter((aircraft) => aircraft.specialInAircraft).length > 0;
    return `<div class="city-table">
                <div id="location-${categoryLocation.pointId}" class="base-card">
                    ${createBaseTableTitle(categoryLocation.pointName, categoryLocation.aircrafts[0].time.substr(0, 5), hasAerobatic)}
                </div>
                <div class="base-table-body">
                    ${createTableCategory("מטס", categoryLocation.aircrafts, "city")}
                </div>
            </div>`;
}

function createBaseTableTitle(name, activeTimes, hasAerobatic) {
    return `<div class="base-table-title">
                    <div class="base-table-title-group">
                        <div class="base-table-title-text">${name}</div>&nbsp;|&nbsp;
                        <div class="base-title-times">${activeTimes}</div>
                    </div>
                    <img src="icons/aerobatic.svg" class="aerobatic-icon" style="visibility:${hasAerobatic ? "visible" : "hidden"}">
                </div>`;
}

function createTableCategories(categories, aircrafts, exhibitions, type) {
    let tableCategoriesDiv = "";
    // flight category
    let categoryAircrafts = aircrafts.filter((aircraft) => {
        return !aircraft.specialInAircraft
    });
    tableCategoriesDiv += createTableCategory("מטס", categoryAircrafts, type);

    categories.forEach((category) => {
        let categoryAircrafts = aircrafts.filter((aircraft) => {
            return aircraft.specialInAircraft === category.category
        });
        if (categoryAircrafts.length > 0 && category.category !== "חזרות")
            tableCategoriesDiv += createTableCategory(category.category, categoryAircrafts, type);
    });

    // add exhibitions section
    if (exhibitions) {
        tableCategoriesDiv += `<div class="showcase-container">
                        <div class="exhibition-category">תערוכה:</div>
                        ${exhibitions}
                    </div>`;
    }

    return tableCategoriesDiv;
}

function createTableCategory(categoryName, categoryAircrafts, type) {
    let flightCategoryTitle = "";
    if (type === "base")
        flightCategoryTitle = `<div class="category-name">
                                <div class="category-title">${categoryName}</div>
                                <div class="category-start-time">${categoryAircrafts[0].time.substr(0, 5)}</div>
                            </div>`;
    let flightCategoryIcons = "";

    let aircraftShown = new Map();
    categoryAircrafts.forEach((aircraft) => {
        if (!aircraftShown[aircraft.name]) {
            flightCategoryIcons += `<div class="aircraft-icon-text">
                            <img class="aircraft-icon" src="icons/aircraft-menu/${aircraft.icon}.svg" title="${aircraft.time.substr(0, 5)}">
                            ${aircraft.name}
                        </div>`;
            aircraftShown[aircraft.name] = true;
        }
    });
    return `<div class="${type}-table-category">${flightCategoryTitle}<div class="${type}-category-icons">${flightCategoryIcons}</div></div>`;
}
