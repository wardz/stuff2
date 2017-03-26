var S3Form = require('aws-s3-form');

/**
 * Setup form generator for client-side direct upload to AWS S3 servers.
 * @param {Object} wagner - Reference to wagner core instance.
 */
module.exports = function(wagner) {
	var formGen = new S3Form({
		accessKeyId: process.env.AWS_PUBLIC_ACCESS_KEY,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		region: process.env.S3_BUCKET_REGION,
		bucket: process.env.S3_BUCKET_NAME,
		secure: process.env.NODE_ENV === 'PRODUCTION',
		policyExpiration: 180
	});

	wagner.constant('formGen', formGen);
};
