import { Link } from 'react-router-dom'
import { site } from '../content/site'

export function Experience() {
  return (
    <article className="content-page">
      <p className="content-page__home">
        <Link to="/">Home</Link>
      </p>
      <header className="content-page__header">
        <h1 className="content-page__title">Experience</h1>

      </header>

      <ol className="exp-list">
        {site.experience.map((job) => (
          <li key={`${job.org}-${job.start}`} className="exp-list__item">
            <div className="exp-list__head">
              <span className="exp-list__dates">
                {job.start} — {job.end}
              </span>
            </div>
            <h2 className="exp-list__title">{job.title}</h2>
            <p className="exp-list__org">
              {job.org}
              <span className="exp-list__sep" aria-hidden>
                ·
              </span>
              <span className="exp-list__loc">{job.location}</span>
            </p>
            <ul className="exp-list__bullets">
              {job.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </article>
  )
}
