import { Link } from 'react-router-dom'
import { site } from '../content/site'

export function Projects() {
  return (
    <article className="content-page">
      <p className="content-page__home">
        <Link to="/">Home</Link>
      </p>
      <header className="content-page__header">
        <h1 className="content-page__title">Projects</h1>
      </header>

      <ul className="project-list">
        {site.projects.map((p) => (
          <li key={p.title} className="project-list__item">
            <div className="project-list__meta">
              <span className="project-list__year">{p.year}</span>
            </div>
            <h2 className="project-list__title">
                {p.title}
            </h2>
            <p className="project-list__deck">{p.deck}</p>
          </li>
        ))}
      </ul>
    </article>
  )
}
