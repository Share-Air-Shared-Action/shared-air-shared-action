<?php

// Set the header Content-Type for JSON
header('Content-Type: application/json');

?>
{
    "PM2.5": {
        "scale": {
            "good": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [12.0, 12.0],
                "fill": "tozeroy",
                "type": "scatter",
                "mode": "none",
                "name": "Good",
                "fillcolor": "rgba(0,228,0,0.5)"
            },
            "moderate": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [35.4, 35.4],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Moderate",
                "fillcolor": "rgba(255,255,0,0.5)"
            },
            "unhfsg": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [55.4, 55.4],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Unhealthy for Sensitive Groups",
                "fillcolor": "rgba(255,126,0,0.5)"
            },
            "unhealthy": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [150.4, 150.4],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Unhealthy",
                "fillcolor": "rgba(255,0,0,0.5)"
            },
            "veryunhealthy": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [250.4, 250.4],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Very Unhealthy",
                "fillcolor": "rgba(153,0,76,0.5)"
            },
            "hazardous": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [99999, 99999],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Hazardous",
                "fillcolor": "rgba(126,0,35,0.5)"
            }
        },
        "range": [0, 60]
    },
    "PM10": {
        "scale": {
            "good": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [54, 54],
                "fill": "tozeroy",
                "type": "scatter",
                "mode": "none",
                "name": "Good",
                "fillcolor": "rgba(0,228,0,0.5)"
            },
            "moderate": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [154, 154],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Moderate",
                "fillcolor": "rgba(255,255,0,0.5)"
            },
            "unhfsg": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [254, 254],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Unhealthy for Sensitive Groups",
                "fillcolor": "rgba(255,126,0,0.5)"
            },
            "unhealthy": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [354, 354],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Unhealthy",
                "fillcolor": "rgba(255,0,0,0.5)"
            },
            "veryunhealthy": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [424, 424],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Very Unhealthy",
                "fillcolor": "rgba(153,0,76,0.5)"
            },
            "hazardous": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [99999, 99999],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Hazardous",
                "fillcolor": "rgba(126,0,35,0.5)"
            }
        },
        "range": [0, 400]
    },
    "CO": {
        "scale": {
            "good": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [4.4, 4.4],
                "fill": "tozeroy",
                "type": "scatter",
                "mode": "none",
                "name": "Good",
                "fillcolor": "rgba(0,228,0,0.5)"
            },
            "moderate": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [9.4, 9.4],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Moderate",
                "fillcolor": "rgba(255,255,0,0.5)"
            },
            "unhfsg": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [12.4, 12.4],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Unhealthy for Sensitive Groups",
                "fillcolor": "rgba(255,126,0,0.5)"
            },
            "unhealthy": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [15.4, 15.4],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Unhealthy",
                "fillcolor": "rgba(255,0,0,0.5)"
            },
            "veryunhealthy": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [30.4, 30.4],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Very Unhealthy",
                "fillcolor": "rgba(153,0,76,0.5)"
            },
            "hazardous": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [99999, 99999],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Hazardous",
                "fillcolor": "rgba(126,0,35,0.5)"
            }
        },
        "range": [0, 20]
    },
    "NO2": {
        "scale": {
            "good": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [53, 53],
                "fill": "tozeroy",
                "type": "scatter",
                "mode": "none",
                "name": "Good",
                "fillcolor": "rgba(0,228,0,0.5)"
            },
            "moderate": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [100, 100],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Moderate",
                "fillcolor": "rgba(255,255,0,0.5)"
            },
            "unhfsg": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [360, 360],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Unhealthy for Sensitive Groups",
                "fillcolor": "rgba(255,126,0,0.5)"
            },
            "unhealthy": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [649, 649],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Unhealthy",
                "fillcolor": "rgba(255,0,0,0.5)"
            },
            "veryunhealthy": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [1249, 1249],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Very Unhealthy",
                "fillcolor": "rgba(153,0,76,0.5)"
            },
            "hazardous": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [99999, 99999],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Hazardous",
                "fillcolor": "rgba(126,0,35,0.5)"
            }
        },
        "range": [0, 660]
    },
    "03": {
        "scale": {
            "good": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [54, 54],
                "fill": "tozeroy",
                "type": "scatter",
                "mode": "none",
                "name": "Good",
                "fillcolor": "rgba(0,228,0,0.5)"
            },
            "moderate": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [70, 70],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Moderate",
                "fillcolor": "rgba(255,255,0,0.5)"
            },
            "unhfsg": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [85, 85],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Unhealthy for Sensitive Groups",
                "fillcolor": "rgba(255,126,0,0.5)"
            },
            "unhealthy": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [105, 105],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Unhealthy",
                "fillcolor": "rgba(255,0,0,0.5)"
            },
            "veryunhealthy": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [200, 200],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Very Unhealthy",
                "fillcolor": "rgba(153,0,76,0.5)"
            },
            "hazardous": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [99999, 99999],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Hazardous",
                "fillcolor": "rgba(126,0,35,0.5)"
            }
        },
        "range": [0, 115]
    }
}
