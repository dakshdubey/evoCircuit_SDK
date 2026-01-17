"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlidingWindow = void 0;
class SlidingWindow {
    buckets = [];
    windowSize;
    bucketCount;
    bucketDuration;
    constructor(windowSizeMs, bucketCount = 10) {
        this.windowSize = windowSizeMs;
        this.bucketCount = bucketCount;
        this.bucketDuration = Math.floor(windowSizeMs / bucketCount);
    }
    recordSuccess(latency) {
        const bucket = this.getOrCreateCurrentBucket();
        bucket.successes++;
        bucket.count++;
        bucket.totalLatency += latency;
    }
    recordFailure(latency) {
        const bucket = this.getOrCreateCurrentBucket();
        bucket.failures++;
        bucket.count++;
        bucket.totalLatency += latency;
    }
    getTotals() {
        this.evictOldBuckets();
        return this.buckets.reduce((acc, bucket) => {
            acc.successes += bucket.successes;
            acc.failures += bucket.failures;
            acc.timeouts += bucket.timeouts;
            acc.totalLatency += bucket.totalLatency;
            acc.count += bucket.count;
            return acc;
        }, { successes: 0, failures: 0, timeouts: 0, totalLatency: 0, count: 0 });
    }
    getOrCreateCurrentBucket() {
        const now = Date.now();
        this.evictOldBuckets();
        const currentBucketTimestamp = Math.floor(now / this.bucketDuration) * this.bucketDuration;
        let bucket = this.buckets.find((b) => b.timestamp === currentBucketTimestamp);
        if (!bucket) {
            bucket = {
                timestamp: currentBucketTimestamp,
                successes: 0,
                failures: 0,
                timeouts: 0,
                totalLatency: 0,
                count: 0,
            };
            this.buckets.push(bucket);
        }
        return bucket;
    }
    evictOldBuckets() {
        const now = Date.now();
        const expiryThreshold = now - this.windowSize;
        this.buckets = this.buckets.filter((b) => b.timestamp >= expiryThreshold);
    }
}
exports.SlidingWindow = SlidingWindow;
