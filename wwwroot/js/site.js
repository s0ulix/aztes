// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

$(document).ready(function () {
    $('#executeTest').click(executeTest);


    function executeTest() {
        var settings = {
            RUs: $('#throughput').val(),
            OptimizeConcurrency: $('#consistency').is(":checked"),
            LazyIndexing: $('#indexing').is(":checked"),
            DocumentCount: $('#documents').val()
        };

        startTest(settings);
        var results = [];
        $.post({
            contentType: "application/json; charset=UTF-8",
            data: JSON.stringify(settings),
            url: "/api/work/load"
        }).done(function (data) {
            data.operation = "Inserts";
            results.push(data);
            $.post({
                contentType: "application/json; charset=UTF-8",
                data: JSON.stringify(settings),
                url: "/api/work/range"
            }).done(function (data) {
                data.operation = "Range";
                results.push(data);
                $.post({
                    contentType: "application/json; charset=UTF-8",
                    data: JSON.stringify(settings),
                    url: "/api/work/item"
                }).done(function (data) {
                    data.operation = "Single Record";
                    results.push(data);
                    showResults(results);
                }).fail(function(msg,status,xhr){
                    results.add({
                        operation:"Error retrieving item",
                        
                    });
                    showResults(results);
                });

            }).fail(function(msg,status,xhr){
                results.add({
                    operation:"Error retrieving range",
                    
                });
                showResults(results);
            });
        }).fail(function(msg,status,xhr){
            results.add({
                operation:"Error loading data",

            });
            showResults(results);
        });

        function showResults(data) {
            var add = "<p>Results</p><table class='table'><thead><tr><th>Operation</th><th>Documents</th><th>Avg. RU/s</th><th>Docs/sec</th><th>Avg. RUs/doc</th></thead><tbody>";
            $(data).each(function (index, item) {
                add += "<tr><td>" + item.operation + "</td><td>" + item.documentCount + "</td><td>" + item.rUsperSecond + "</td><td>" + item.documentsperSecond + "</td><td>" + item.rUsperDocument +"</td></tr>";
            });
            add += "</tbody></table>";
            var output = $('#output').html() + add;
            $('#output').html(output);
        }
    }

    function startTest(settings) {
        var output = $('#output').html();
        var start = new Date();
        var add = "<h5>Test Started at: " + twoDigit(start.getHours()) + ":" + twoDigit(start.getMinutes()) + ":" + twoDigit(start.getSeconds()) + "</h5>";
        add += "<p>Settings<p><ul><li>RUs: <b>" + settings.RUs + "</b></li>" +
            "<li>Document Count<b>" + settings.DocumentCount + "</b></li>" +
            "<li>Lazy Indexing<b>" + settings.LazyIndexing + "</b></li>" +
            "<li>Eventual Concurrency<b>" + settings.OptimizeConcurrency + "</b></li></ul>";
        $('#output').html(output + add);

    }

    function twoDigit(val) {
        return val < 10 ? "0" + val : val;
    }
});
