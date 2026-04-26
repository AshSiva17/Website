import { Link } from 'react-router-dom'
import { HeroBasketballText } from '../components/HeroBasketballText'
import { site } from '../content/site'

export function Home() {
  return (
    <article className="hero-page">
      <div className="hero-page__heading">
        <h1 className="hero-page__title">{site.name}</h1>
        <a
          href={`mailto:${site.contact.email}`}
          className="hero-page__profile"
          aria-label={`Email ${site.name}`}
        >
          <img
            src={site.profileImage}
            alt=""
            width={48}
            height={48}
            className="hero-page__avatar"
            decoding="async"
          />
        </a>
      </div>
      <HeroBasketballText text={site.heroDeck} />
      <p className="hero-page__links">
        <Link to="/projects" className="hero-page__link">
          Projects
        </Link>
        <span className="hero-page__dot" aria-hidden>
          ·
        </span>
        <Link to="/experience" className="hero-page__link">
          Experience
        </Link>
        <span className="hero-page__dot" aria-hidden>
          ·
        </span>
        <Link to="/photos" className="hero-page__link">
          Photos
        </Link>
      </p>
    </article>
  )
}
