export default {
  slug: 'rust-tokio-select',
  title: 'Rust async: racing tasks with tokio::select!',
  date: '2026-02-26',
  readMin: 17,
  tags: ['Rust', 'Async'],
  excerpt:
    'Use select! to wait on multiple branches, cancel slow paths, and build timeouts without blocking threads.',
  sections: [
    {
      p: [
        'In async Rust, tokio::select! waits concurrently on several futures. The first branch to complete wins; other branches are dropped, which cancels work if those futures are cancellation-aware (many Tokio I/O types are).',
        'This is the idiomatic building block for deadlines, shutdown signals, and multiplexed sockets. It maps closely to epoll/kqueue readiness: you describe multiple await points and handle whichever completes first.',
      ],
    },
    {
      h2: 'Timeout around an operation',
    },
    {
      p: [
        'Pattern: race long-running work against sleep. If sleep wins, you abandon work—ensure work checks cancellation or uses timeouts internally for I/O (e.g. TcpStream::connect with timeout) to avoid orphaned background tasks.',
      ],
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
        'select! evaluates branches in declaration order by default. Use biased; when one branch should always take precedence (e.g. shutdown over work) to avoid starvation if work constantly completes.',
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
      h2: 'JoinSet for fan-out',
    },
    {
      p: [
        'select! is for heterogeneous branches. When spawning many homogeneous tasks, tokio::task::JoinSet lets you await completion in a loop without writing N branches. Combine JoinSet with a shutdown channel for structured cancellation.',
      ],
    },
    {
      code: {
        lang: 'rust',
        code: `use tokio::task::JoinSet;

async fn fan_out(urls: Vec<String>) {
    let mut set = JoinSet::new();
    for u in urls {
        set.spawn(async move { reqwest::get(&u).await });
    }
    while let Some(res) = set.join_next().await {
        let _ = res.expect("panic in task");
    }
}`,
      },
    },
    {
      note: 'Dropping futures can leak resources if a future holds a mutex guard across an await point—keep critical sections small and avoid std::sync::Mutex in async code; use tokio::sync::Mutex.',
    },
    {
      h2: 'Pinning and macro hygiene',
    },
    {
      p: [
        'Branches that borrow across await store their state in the select! macro’s generated future; the macro requires branches to implement the right pinning behavior. If you hit borrow errors, extract branches into async fn or use tokio::spawn for owned work.',
      ],
    },
  ],
}
