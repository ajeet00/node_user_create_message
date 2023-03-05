exports.customeResponse = function (res, status, msg, data) {
	var data = {
		status: status,
		message: msg,
		data : data
	};
	return res.status(status).json(data);
}