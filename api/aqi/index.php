<?php

// Set the header Content-Type for JSON
header('Content-Type: application/json');

?>
{
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
        "range": [0, 20],
        "unit": "CO (ppm)"
    },
    "CO2": {
        "unit": "CO<sub>2</sub> (ppm)"
    },
    "NO": {
        "unit": "NO (ppb)"
    },
    "NO2": {
        "scale": {
            "good": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [0.053, 0.053],
                "fill": "tozeroy",
                "type": "scatter",
                "mode": "none",
                "name": "Good",
                "fillcolor": "rgba(0,228,0,0.5)"
            },
            "moderate": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [0.1, 0.1],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Moderate",
                "fillcolor": "rgba(255,255,0,0.5)"
            },
            "unhfsg": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [0.36, 0.36],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Unhealthy for Sensitive Groups",
                "fillcolor": "rgba(255,126,0,0.5)"
            },
            "unhealthy": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [0.649, 0.649],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Unhealthy",
                "fillcolor": "rgba(255,0,0,0.5)"
            },
            "veryunhealthy": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [1.249, 1.249],
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
        "range": [0, 0.7],
        "unit": "NO<sub>2</sub> (ppb)"
    },
    "O3": {
        "scale": {
            "good": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [0.054, 0.054],
                "fill": "tozeroy",
                "type": "scatter",
                "mode": "none",
                "name": "Good",
                "fillcolor": "rgba(0,228,0,0.5)"
            },
            "moderate": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [0.070, 0.070],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Moderate",
                "fillcolor": "rgba(255,255,0,0.5)"
            },
            "unhfsg": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [0.085, 0.085],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Unhealthy for Sensitive Groups",
                "fillcolor": "rgba(255,126,0,0.5)"
            },
            "unhealthy": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [0.105, 0.105],
                "fill": "tonexty",
                "type": "scatter",
                "mode": "none",
                "name": "Unhealthy",
                "fillcolor": "rgba(255,0,0,0.5)"
            },
            "veryunhealthy": {
                "x": ["1980-01-01 00:00:00", "2500-01-01 00:00:00"],
                "y": [0.200, 0.200],
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
        "range": [0, 0.15],
        "unit": "O<sub>3</sub> (ppm)"
    },
    "PM1.0": {
        "unit": "PM<sub>1.0</sub> (&mu;g/m<sup>3</sup>)"
    },
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
        "range": [0, 60],
        "unit": "PM<sub>2.5</sub> (&mu;g/m<sup>3</sup>)"
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
        "range": [0, 400],
        "unit": "PM<sub>10</sub> (&mu;g/m<sup>3</sup>)"
    }
}
