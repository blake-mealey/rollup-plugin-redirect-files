/* eslint-disable no-console */

class Logger {
    static log(message, ...optionalParams) {
        console.log(message, ...optionalParams);
    }
}

export default Logger;
