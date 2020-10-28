exports.ShopItem = {
	type: 'object',
	properties:
	{
		id: {
			type: 'integer',
		},
		name: {
			type: 'string',
		},
		description: {
			type: 'string',
		},
		descriptionRu: {
			type: 'string',
		},
		descriptionHe: {
			type: 'string',
		},
		cost: {
			type: 'integer',
		},
		amountAvailable: {
			type: 'integer',
		},
		sellByDate: {
			type: 'string',
			format: 'date',
		},
	},
	additionalProperties: false,
};
