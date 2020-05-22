export const message = {
  tables: {
/*
	DEFAULT: [
	  {dimensions: ['Arts & Entertainment'], metrics: [0.008838],},
	  {dimensions: ['Computers & Electronics'], metrics: [0.015036],},
	  {dimensions: ['Food & Drink'], metrics: [0.206066],},
	  {dimensions: ['Health'], metrics: [0.012262],},
	  {dimensions: ['Home & Garden'], metrics: [0.00799],},
	  {dimensions: ['Pets & Animals'], metrics: [0.00214],},
	  {dimensions: ['Shopping'], metrics: [0.045697],},
	  {dimensions: ['Sports'], metrics: [0.001561],},
	  {dimensions: ['Travel'], metrics: [0.017569],},
	],
*/
    DEFAULT: [
      {dimensions: ['Intelligence','Captain America'], metrics: [.3],},
	  {dimensions: ['Strength','Captain America'], metrics: [.3],},
	  {dimensions: ['Speed','Captain America'], metrics: [.2],},
	  {dimensions: ['Durability','Captain America'], metrics: [.3],},
	  {dimensions: ['Energy','Captain America'], metrics: [.1],},
	  {dimensions: ['Fighting Skills','Captain America'], metrics: [.6],},
	  {dimensions: ['Intelligence','Iron Man'], metrics: [.6],},
	  {dimensions: ['Strength','Iron Man'], metrics: [.6],},
	  {dimensions: ['Speed','Iron Man'], metrics: [.5],},
	  {dimensions: ['Durability','Iron Man'], metrics: [.6],},
	  {dimensions: ['Energy','Iron Man'], metrics: [.6],},
	  {dimensions: ['Fighting Skills','Iron Man'], metrics: [.4],},
	  {dimensions: ['Intelligence','Hulk'], metrics: [.6],},
	  {dimensions: ['Strength','Hulk'], metrics: [.7],},
	  {dimensions: ['Speed','Hulk'], metrics: [.3],},
	  {dimensions: ['Durability','Hulk'], metrics: [.7],},
	  {dimensions: ['Energy','Hulk'], metrics: [.1],},
	  {dimensions: ['Fighting Skills','Hulk'], metrics: [.4],},
	  {dimensions: ['Intelligence','Thor'], metrics: [.2],},
	  {dimensions: ['Strength','Thor'], metrics: [.7],},
	  {dimensions: ['Speed','Thor'], metrics: [.7],},
	  {dimensions: ['Durability','Thor'], metrics: [.6],},
	  {dimensions: ['Energy','Thor'], metrics: [.6],},
	  {dimensions: ['Fighting Skills','Thor'], metrics: [.4],},
    ],
  },
  fields: {
    dimensions: [
      {
        id: 'qt_7luivd0mxb',
        name: 'Taxonomy',
        type: 'TEXT',
        concept: 'DIMENSION',
      },
      {
        id: 'qt_8luivd0mxb',
        name: 'Super Hero',
        type: 'TEXT',
        concept: 'DIMENSION',
      },
    ],
    metrics: [
      {
        id: 'qt_9luivd0mxb',
        name: 'Rating',
        type: 'NUMBER',
        concept: 'METRIC',
      },
    ],
  },
  style: {
    node_color: {
      value: '#eb8034',
      defaultValue: '#eb8034',
    },
    link_color: {
      value: '#eb8034',
      defaultValue: '#eb8034',
    },
    link_opacity: {
      value: 0.2,
      defaultValue: 0.2,
    },
    show_labels: {
      value: true,
      defaultValue: true,
    },
    show_legend: {
	    value: true,
	    defaultValue: true,
    },
    font_family: {
	    value: 'Roboto',
	    defaultValue: 'Roboto',
    },
    level_color: {
	    value: 'Grey',
	    defaultValue: 'Grey',
    },
    label_color: {
	    value: '#737373',
	    defaultValue: '#737373',
    },
    line_color: {
	    value: 'grey',
	    defaultValue: 'grey'
    },
    filter_color: {
	    value: 'red',
	    defaultValue: 'red'
    },
    font_size: {
      value: 12,
      defaultValue: 12,
    },
    font_color: {
      value: 'orange',
      defaultValue: 'orange',
    },
    left_offset: {
      value: 20,
      defaultValue: 20,
    },
    right_offset: {
      value: 20,
      defaultValue: 20,
    },
  },
  theme: {
    themeFillColor: {
      color: '#fff',
      opacity: 1,
    },
    themeFontColor: {
      color: '#616161',
      opacity: 1,
    },
    themeFontFamily: 'Roboto',
    themeAccentFillColor: {
      color: '#4285F4',
      opacity: 1,
    },
    themeAccentFontColor: {
      color: '#EFEFEF',
      opacity: 1,
    },
    themeAccentFontFamily: 'Roboto',
    themeSeriesColor: [
      {
        color: '#4285F4',
        opacity: 1,
      },
      {
        color: '#DB4437',
        opacity: 1,
      },
      {
        color: '#F4B400',
        opacity: 1,
      },
      {
        color: '#0F9D58',
        opacity: 1,
      },
      {
        color: '#AB47BC',
        opacity: 1,
      },
      {
        color: '#00ACC1',
        opacity: 1,
      },
      {
        color: '#FF7043',
        opacity: 1,
      },
      {
        color: '#9E9D24',
        opacity: 1,
      },
      {
        color: '#5C6BC0',
        opacity: 1,
      },
      {
        color: '#F06292',
        opacity: 1,
      },
      {
        color: '#00796b',
        opacity: 1,
      },
      {
        color: '#c2185b',
        opacity: 1,
      },
      {
        color: '#7e57c2',
        opacity: 1,
      },
      {
        color: '#03a9f4',
        opacity: 1,
      },
      {
        color: '#8bc34a',
        opacity: 1,
      },
      {
        color: '#fdd835',
        opacity: 1,
      },
      {
        color: '#fb8c00',
        opacity: 1,
      },
      {
        color: '#8d6e63',
        opacity: 1,
      },
      {
        color: '#9e9e9e',
        opacity: 1,
      },
      {
        color: '#607d8b',
        opacity: 1,
      },
    ],
    themeIncreaseColor: {
      color: '#388e3c',
      opacity: 1,
    },
    themeDecreaseColor: {
      color: '#f44336',
      opacity: 1,
    },
    themeGridColor: {
      color: '#e9e9e9',
      opacity: 1,
    },
  },
  interactions: {
    onClick: {
      value: {
        type: 'FILTER',
        data: {
          concepts: ['qt_7luivd0mxb'],
          values: [['Fighting Skills']],
        },
      },
      supportedActions: ['FILTER'],
    },
  },
};
