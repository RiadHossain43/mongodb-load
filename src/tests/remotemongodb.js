import { check, group, sleep } from 'k6';
import http from 'k6/http';

export let options = {
    stages: [
        { duration: "30s", target: 1000 },
        { duration: "4m", target: 1000 },
        { duration: "30s", target: 0 }
    ],
}

export default function () {
    group('Health testing', function () {
        let variables = {
            base_url: 'http://localhost:8000',
        }
        group('Check health status', function () {
            let res = http.get(`${variables.base_url}/remotetest`);
            check(res, { "status is 200": (r) => r.status === 200 });
        });
    });
    sleep(1);
}