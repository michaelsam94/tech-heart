export default {
  slug: 'rust-tokio-select',
  title: 'Rust async: racing tasks with tokio::select!',
  date: '2026-02-26',
  readMin: 9,
  tags: ['Rust', 'Async'],
  excerpt:
    'Use select! to wait on multiple branches, cancel slow paths, and build timeouts without blocking threads.',
  sections: [
    {
      p: [
        'In async Rust, tokio::select! waits concurrently on several futures. The first branch to complete wins; other branches are dropped, which cancels work if those futures are cancellation-aware (many Tokio I/O types are).',
        'This is the idiomatic building block for deadlines, shutdown signals, and multiplexed sockets.',
      ],
    },
    {
      h2: 'Timeout around an operation',
    },
    {
      code: {
        lang: 'rust',
        code: `use tokio::time::{sleep, Duration};

async fn work() {
    sleep(Duration::from_secs(10)).await;
}

#[tokio::main]
async fn main() {
    tokio::select! {
        _ = work() => println!("finished work"),
        _ = sleep(Duration::from_millis(500)) => println!("timed out"),
    }
}`,
      },
    },
    {
      h2: 'Biased polling order',
    },
    {
      p: [
        'select! evaluates branches in declaration order by default. Use biased; when one branch should always take precedence (e.g. shutdown over work) to avoid starvation.',
      ],
    },
    {
      code: {
        lang: 'rust',
        code: `tokio::select! {
    biased;
    _ = shutdown.recv() => {
        // handle graceful shutdown first
    }
    msg = socket.recv() => {
        // process traffic
    }
}`,
      },
    },
    {
      note: 'Dropping futures can leak resources if a future holds a mutex guard across an await point—keep critical sections small and prefer structured concurrency (tokio::spawn + JoinSet) for complex fan-out.',
    },
  ],
}
