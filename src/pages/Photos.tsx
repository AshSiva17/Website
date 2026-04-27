import { Link } from 'react-router-dom'
import { site } from '../content/site'

export function Photos() {
  return (
    <article className="content-page">
      <p className="content-page__home">
        <Link to="/">Home</Link>
      </p>
      <header className="content-page__header">
        <h1 className="content-page__title">Photos</h1>
      </header>

      <ul className="photo-grid">
        {site.photos.map((photo) => (
          <li key={photo.src} className="photo-grid__item">
            <figure className="photo-card">
              <img
                src={photo.src}
                alt={photo.alt}
                width={900}
                height={600}
                loading="lazy"
                decoding="async"
                className="photo-card__img"
              />
            </figure>
          </li>
        ))}
      </ul>
    </article>
  )
}
